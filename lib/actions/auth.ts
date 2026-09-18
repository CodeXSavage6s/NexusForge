"use server"

import { auth } from '@/lib/better-auth/auth'
import { headers } from 'next/headers'
import db from "@/database/index";
import { user, account } from "@/database/schema/auth-schema";
import { pendingSignups } from "@/database/schema/pending-signup-schema";
// NOTE: adjust this import path to wherever schema.ts actually lives in this project
import {
  workspaces,
  workspaceMembers,
  projectMembers,
  activity,
  notifications,
  files,
  timeEntries,
} from "@/database/schema/schema";
import { and, eq, isNull, lt } from "drizzle-orm";
import { authClient } from '@/lib/better-auth/auth-client'
import { sendSignupOtpEmail, sendWelcomeEmail } from "@/lib/actions/mails";
import {
  decryptPendingPassword,
  encryptPendingPassword,
  generateNumericOtp,
  generatePendingSignupToken,
  hashOtp,
  verifyOtp,
} from "@/lib/security/pending-signup-crypto";

////////////////////////////////////////////////////////////////////////////
// OTP-FIRST EMAIL/PASSWORD SIGNUP
////////////////////////////////////////////////////////////////////////////
//
// Flow: startSignup() -> (email OTP) -> verifySignupOtp() -> real Better
// Auth user is created and the caller is signed in.
//
// The core invariant this whole section exists to uphold: NOTHING is
// written to Better Auth's `user` table until verifySignupOtp() confirms
// the correct OTP. Until then, all we have is a row in `pending_signups`
// (see database/schema/pending-signup-schema.ts), which is not part of
// Better Auth's schema and confers no ability to sign in.

const OTP_EXPIRY_MINUTES = 8;
const PENDING_SIGNUP_TTL_MINUTES = 30; // hard cap — abandoned signups die after this
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;
const MAX_RESENDS = 6; // per pending record, i.e. per PENDING_SIGNUP_TTL_MINUTES window

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface StartSignupState {
  success: boolean;
  error?: string;
  token?: string;
  email?: string;
}

function minutesFromNow(minutes: number): Date {
  return new Date(Date.now() + minutes * 60_000);
}

function isPendingSignupExpired(row: { createdAt: Date }): boolean {
  return Date.now() - row.createdAt.getTime() > PENDING_SIGNUP_TTL_MINUTES * 60_000;
}

/**
 * Best-effort, non-blocking cleanup of abandoned pending signups. Cheap
 * enough to call opportunistically (Requirement 8) — no cron needed.
 * Failures here must never break the signup flow, so this always swallows
 * its own errors.
 */
async function cleanupExpiredPendingSignups() {
  try {
    const cutoff = new Date(Date.now() - PENDING_SIGNUP_TTL_MINUTES * 60_000);
    await db.delete(pendingSignups).where(lt(pendingSignups.createdAt, cutoff));
  } catch (err) {
    console.error("Pending signup cleanup failed (non-fatal):", err);
  }
}

async function sendOtpForPendingSignup(params: {
  email: string;
  name: string;
  otp: string;
}) {
  await sendSignupOtpEmail({
    to: params.email,
    name: params.name,
    otp: params.otp,
    expiresInMinutes: OTP_EXPIRY_MINUTES,
  });
}

/**
 * Step 1 of the signup flow. Validates input, creates (or refreshes) a
 * pending_signups row, and emails a fresh OTP. Never creates a Better
 * Auth user.
 */
export async function startSignup(data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<StartSignupState> {
  const name = data.name?.trim() ?? "";
  const email = data.email?.trim().toLowerCase() ?? "";
  const password = data.password ?? "";
  const confirmPassword = data.confirmPassword ?? "";

  // Server-side validation — never trust the client's validation alone.
  if (!name || name.length < 2) {
    return { success: false, error: "Please enter your full name." };
  }
  if (!email || !EMAIL_RE.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }
  if (!password || password.length < 8 || password.length > 128) {
    return { success: false, error: "Password must be between 8 and 128 characters." };
  }
  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match." };
  }

  // Opportunistic cleanup of abandoned records — cheap, non-blocking.
  await cleanupExpiredPendingSignups();

  try {
    // 7A. Email already belongs to a real, existing account.
    const existingUser = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return {
        success: false,
        error: "An account with this email already exists. Try signing in instead.",
      };
    }

    // 7B. There's already a pending signup for this email.
    const [existingPending] = await db
      .select()
      .from(pendingSignups)
      .where(eq(pendingSignups.email, email))
      .limit(1);

    if (existingPending && !isPendingSignupExpired(existingPending)) {
      const secondsSinceLastSend = (Date.now() - existingPending.lastSentAt.getTime()) / 1000;
      const onCooldown = secondsSinceLastSend < RESEND_COOLDOWN_SECONDS;
      const resendsExhausted = existingPending.resendCount >= MAX_RESENDS;

      // Always safe to refresh name/password (doesn't touch the OTP or
      // rate limits) so the eventual account reflects the latest submission.
      const passwordEncrypted = encryptPendingPassword(password);

      if (onCooldown || resendsExhausted) {
        // Don't send a new OTP, but let the client proceed to the
        // verification page — a still-valid code is already in flight.
        await db
          .update(pendingSignups)
          .set({ name, passwordEncrypted })
          .where(eq(pendingSignups.id, existingPending.id));

        return { success: true, token: existingPending.token, email };
      }

      const otp = generateNumericOtp();
      const { hash, salt } = hashOtp(otp);

      await db
        .update(pendingSignups)
        .set({
          name,
          passwordEncrypted,
          otpHash: hash,
          otpSalt: salt,
          otpExpiresAt: minutesFromNow(OTP_EXPIRY_MINUTES),
          otpAttempts: 0,
          resendCount: existingPending.resendCount + 1,
          lastSentAt: new Date(),
        })
        .where(eq(pendingSignups.id, existingPending.id));

      await sendOtpForPendingSignup({ email, name, otp });

      return { success: true, token: existingPending.token, email };
    }

    // No usable pending record — create a fresh one. If an expired one
    // exists, replace it (ON CONFLICT on the unique email column).
    const token = generatePendingSignupToken();
    const passwordEncrypted = encryptPendingPassword(password);
    const otp = generateNumericOtp();
    const { hash, salt } = hashOtp(otp);
    const now = new Date();

    await db
      .insert(pendingSignups)
      .values({
        token,
        email,
        name,
        passwordEncrypted,
        otpHash: hash,
        otpSalt: salt,
        otpExpiresAt: minutesFromNow(OTP_EXPIRY_MINUTES),
        otpAttempts: 0,
        resendCount: 1,
        lastSentAt: now,
        consumedAt: null,
      })
      .onConflictDoUpdate({
        target: pendingSignups.email,
        set: {
          token,
          name,
          passwordEncrypted,
          otpHash: hash,
          otpSalt: salt,
          otpExpiresAt: minutesFromNow(OTP_EXPIRY_MINUTES),
          otpAttempts: 0,
          resendCount: 1,
          lastSentAt: now,
          consumedAt: null,
        },
      });

    await sendOtpForPendingSignup({ email, name, otp });

    return { success: true, token, email };
  } catch (err: any) {
    console.error("startSignup failed:", err?.message ?? err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export interface ResendSignupOtpState {
  success: boolean;
  error?: string;
  cooldownSeconds?: number;
}

/**
 * Explicit "resend code" action from the OTP page. Only ever refreshes
 * the OTP for an existing pending signup — never touches name/password,
 * never creates anything.
 */
export async function resendSignupOtp(token: string): Promise<ResendSignupOtpState> {
  if (!token) {
    return { success: false, error: "Invalid or expired signup session." };
  }

  try {
    const [pending] = await db
      .select()
      .from(pendingSignups)
      .where(eq(pendingSignups.token, token))
      .limit(1);

    if (!pending || pending.consumedAt || isPendingSignupExpired(pending)) {
      return {
        success: false,
        error: "This signup session has expired. Please start again.",
      };
    }

    const secondsSinceLastSend = (Date.now() - pending.lastSentAt.getTime()) / 1000;
    if (secondsSinceLastSend < RESEND_COOLDOWN_SECONDS) {
      return {
        success: false,
        error: "Please wait before requesting another code.",
        cooldownSeconds: Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLastSend),
      };
    }

    if (pending.resendCount >= MAX_RESENDS) {
      return {
        success: false,
        error: "Too many codes requested. Please try again later.",
      };
    }

    const otp = generateNumericOtp();
    const { hash, salt } = hashOtp(otp);

    await db
      .update(pendingSignups)
      .set({
        otpHash: hash,
        otpSalt: salt,
        otpExpiresAt: minutesFromNow(OTP_EXPIRY_MINUTES),
        otpAttempts: 0,
        resendCount: pending.resendCount + 1,
        lastSentAt: new Date(),
      })
      .where(eq(pendingSignups.id, pending.id));

    await sendOtpForPendingSignup({ email: pending.email, name: pending.name, otp });

    return { success: true };
  } catch (err: any) {
    console.error("resendSignupOtp failed:", err?.message ?? err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export interface PendingSignupInfoState {
  success: boolean;
  email?: string;
  error?: string;
}

/**
 * Lets the OTP page display which email it's verifying, even after a
 * page refresh (when the client no longer has it in memory). The token
 * only ever resolves to its own pending record — nothing else.
 */
export async function getPendingSignupEmail(token: string): Promise<PendingSignupInfoState> {
  if (!token) return { success: false, error: "Invalid signup session." };

  const [pending] = await db
    .select({ email: pendingSignups.email, createdAt: pendingSignups.createdAt, consumedAt: pendingSignups.consumedAt })
    .from(pendingSignups)
    .where(eq(pendingSignups.token, token))
    .limit(1);

  if (!pending || pending.consumedAt || isPendingSignupExpired(pending)) {
    return { success: false, error: "This signup session has expired." };
  }

  return { success: true, email: pending.email };
}

export interface VerifySignupOtpState {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

/**
 * Step 2 (final step) of the signup flow. Verifies the OTP and, only on
 * success, creates the real Better Auth account and signs the user in.
 */
export async function verifySignupOtp(params: {
  token: string;
  otp: string;
}): Promise<VerifySignupOtpState> {
  const token = params.token?.trim();
  const otp = params.otp?.trim();

  if (!token || !otp || !/^\d{6}$/.test(otp)) {
    return { success: false, error: "Enter the 6-digit code from your email." };
  }

  try {
    const [pending] = await db
      .select()
      .from(pendingSignups)
      .where(eq(pendingSignups.token, token))
      .limit(1);

    if (!pending || pending.consumedAt) {
      return { success: false, error: "This signup session is no longer valid. Please start again." };
    }

    if (isPendingSignupExpired(pending) || pending.otpExpiresAt.getTime() < Date.now()) {
      return { success: false, error: "This code has expired. Request a new one." };
    }

    if (pending.otpAttempts >= MAX_OTP_ATTEMPTS) {
      return {
        success: false,
        error: "Too many incorrect attempts. Request a new code.",
      };
    }

    const isValid = verifyOtp(otp, pending.otpHash, pending.otpSalt);

    if (!isValid) {
      await db
        .update(pendingSignups)
        .set({ otpAttempts: pending.otpAttempts + 1 })
        .where(eq(pendingSignups.id, pending.id));

      const attemptsLeft = MAX_OTP_ATTEMPTS - (pending.otpAttempts + 1);
      return {
        success: false,
        error:
          attemptsLeft > 0
            ? `Incorrect code. ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} left.`
            : "Too many incorrect attempts. Request a new code.",
      };
    }

    // Atomically "claim" this pending signup so it can only ever be
    // consumed once, even if two verify requests race each other.
    const claimed = await db
      .update(pendingSignups)
      .set({ consumedAt: new Date() })
      .where(and(eq(pendingSignups.id, pending.id), isNull(pendingSignups.consumedAt)))
      .returning({ id: pendingSignups.id });

    if (claimed.length === 0) {
      // Someone else (another concurrent request) already consumed it.
      return { success: false, error: "This code has already been used." };
    }

    // Double-check no account was created for this email in the
    // meantime (belt-and-suspenders alongside user.email's unique
    // constraint, which is the real guarantee against Requirement 7C).
    const raceCheck = await db.select({ id: user.id }).from(user).where(eq(user.email, pending.email)).limit(1);
    if (raceCheck.length > 0) {
      await db.delete(pendingSignups).where(eq(pendingSignups.id, pending.id));
      return {
        success: false,
        error: "An account with this email already exists. Try signing in instead.",
      };
    }

    const plainPassword = decryptPendingPassword(pending.passwordEncrypted);

    // This is the ONLY place in the OTP-first flow that creates a real
    // Better Auth account — and it only runs after the OTP above was
    // confirmed correct. `autoSignIn: true` (already configured in
    // lib/better-auth/auth.ts) makes Better Auth create the session and
    // set the cookie for us via the `nextCookies()` plugin, exactly the
    // same mechanism the rest of this app already relies on — nothing
    // here fabricates a session/cookie by hand.
    let createdUserId: string | undefined;
    try {
      const signUpResult = await auth.api.signUpEmail({
        body: { name: pending.name, email: pending.email, password: plainPassword },
        headers: await headers(),
      });
      createdUserId = signUpResult?.user?.id;
    } catch (err: any) {
      console.error("Account creation after OTP verification failed:", err?.message ?? err);
      // The pending signup is already consumed at this point — don't
      // leave the user stuck with no way forward.
      await db.delete(pendingSignups).where(eq(pendingSignups.id, pending.id));
      const message = err?.body?.message || err?.message;
      if (typeof message === "string" && /already exists|already in use/i.test(message)) {
        return {
          success: false,
          error: "An account with this email already exists. Try signing in instead.",
        };
      }
      return { success: false, error: "Couldn't create your account. Please try again." };
    }

    if (!createdUserId) {
      return { success: false, error: "Couldn't create your account. Please try again." };
    }

    // `sendOnSignUp` is disabled (see lib/better-auth/auth.ts), so no
    // verification-link email was sent by the call above. The OTP the
    // user just entered IS the verification, so mark the account
    // verified immediately.
    await db.update(user).set({ emailVerified: true }).where(eq(user.id, createdUserId));

    // Pending signup fully served its purpose — remove it so the OTP
    // can never be replayed.
    await db.delete(pendingSignups).where(eq(pendingSignups.id, pending.id));

    // Mirrors what `emailVerification.afterEmailVerification` sends for
    // the link-based flow; we send it explicitly here since that hook
    // only fires from the link-click route, not from this direct path.
    try {
      await sendWelcomeEmail({
        to: pending.email,
        name: pending.name,
        loginUrl: `${process.env.BETTER_AUTH_URL}/sign-in`,
      });
    } catch (err) {
      // Non-fatal — the account is already created and verified.
      console.error("Failed to send welcome email:", err);
    }

    return { success: true, redirectTo: "/home" };
  } catch (err: any) {
    console.error("verifySignupOtp failed:", err?.message ?? err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function signIn({ email, password }: { email: string; password: string }) {
  try {
    const data = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
    return { success: true as const, data };
  } catch (err: any) {
    console.error("Sign In Failed", err);
    
    const message = err?.message || err?.body?.message || "Failed to sign in";
    return {
      success: false as const,
      error: message,
    };
  }
}

export async function signOut() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
    console.log("signed out");
    return { success: true as const };
  } catch (err: any) {
    console.error("sign out failed", err);
    return { success: false as const, error: err?.message || "Sign out failed" };
  }
}

////Profile & Settings

export interface UpdateProfileState {
  success: boolean;
  error?: string;
  fieldErrors?: {
    name?: string;
    image?: string;
  };
}

const IMAGE_URL_RE = /^https?:\/\/.+/i;

export async function updateProfile(data: {
  name: string;
  image?: string;
}): Promise<UpdateProfileState> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { success: false, error: "You must be signed in to do that." };
  }

  const name = data.name?.trim() ?? "";
  const image = data.image?.trim();

  const fieldErrors: UpdateProfileState["fieldErrors"] = {};

  if (!name) {
    fieldErrors.name = "Name is required.";
  } else if (name.length > 100) {
    fieldErrors.name = "Name must be under 100 characters.";
  }

  if (image && !IMAGE_URL_RE.test(image)) {
    fieldErrors.image = "Enter a valid URL (starting with http:// or https://).";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  try {
    await db
      .update(user)
      .set({ name, image: image || null })
      .where(eq(user.id, session.user.id));

    return { success: true };
  } catch (err: any) {
    console.error("Update profile failed", err);
    return { success: false, error: "Couldn't save your profile. Try again." };
  }
}

export interface ChangePasswordState {
  success: boolean;
  error?: string;
}

export interface ResendVerificationEmailState {
  success: boolean;
  error?: string;
}

export async function resendVerificationEmail(): Promise<ResendVerificationEmailState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { success: false, error: "You must be signed in to do that." };
  }

  if (session.user.emailVerified) {
    return { success: true };
  }

  try {
    await auth.api.sendVerificationEmail({
      body: {
        email: session.user.email,
        callbackURL: "/settings/profile",
      },
      headers: await headers(),
    });

    return { success: true };
  } catch (err: any) {
    console.error("Failed to resend verification email:", err);
    const message =
      err?.message || err?.body?.message || "Failed to send verification email.";
    return { success: false, error: message };
  }
}

export async function hasPasswordAccount(userId: string): Promise<boolean> {
  const accounts = await db
    .select({ providerId: account.providerId, password: account.password })
    .from(account)
    .where(eq(account.userId, userId));

  return accounts.some((a) => a.providerId === "credential" && !!a.password);
}

export interface RequestPasswordResetState {
  success: boolean;
  error?: string;
}

export async function requestPasswordReset(
  email: string
): Promise<RequestPasswordResetState> {
  const trimmedEmail = email?.trim().toLowerCase();

  if (!trimmedEmail) {
    return { success: false, error: "Enter your email address." };
  }

  try {
    await auth.api.forgetPassword({
      body: {
        email: trimmedEmail,
        redirectTo: "/reset-password",
      },
    });

    // Always report success, whether or not that email has an account —
    // otherwise this becomes a way to check which emails are registered.
    return { success: true };
  } catch (err) {
    console.error("Failed to request password reset:", err);
    // Same reasoning: don't leak anything more specific to the caller.
    return { success: true };
  }
}

export interface ResetPasswordState {
  success: boolean;
  error?: string;
}

export async function resetPassword({
  token,
  newPassword,
}: {
  token: string;
  newPassword: string;
}): Promise<ResetPasswordState> {
  if (!token) {
    return { success: false, error: "This reset link is invalid or has expired." };
  }

  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: "New password must be at least 8 characters." };
  }

  try {
    await auth.api.resetPassword({
      body: { newPassword, token },
    });

    return { success: true };
  } catch (err: any) {
    console.error("Failed to reset password:", err);
    const message =
      err?.message || err?.body?.message || "This reset link is invalid or has expired.";
    return { success: false, error: message };
  }
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<ChangePasswordState> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { success: false, error: "You must be signed in to do that." };
  }

  if (!data.currentPassword) {
    return { success: false, error: "Enter your current password." };
  }

  if (!data.newPassword || data.newPassword.length < 8) {
    return { success: false, error: "New password must be at least 8 characters." };
  }

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    });

    return { success: true };
  } catch (err: any) {
    console.error("Change password failed", err);
    const message = err?.message || err?.body?.message || "Failed to change password.";
    return { success: false, error: message };
  }
}

export interface DeleteAccountState {
  success: boolean;
  error?: string;
}

export async function deleteAccount(): Promise<DeleteAccountState> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { success: false, error: "You must be signed in to do that." };
  }

  const userId = session.user.id;
  const requestHeaders = await headers();

  try {
    // Sessions and accounts cascade-delete via the FK constraints on `user.id`.
    // Everything below has no DB-level FK to user.id (see schema TODOs), so it
    // won't cascade — clean it up explicitly, in the same transaction, before
    // removing the user row.
    await db.transaction(async (tx) => {
      // Memberships the user holds in workspaces/projects owned by others.
      await tx.delete(workspaceMembers).where(eq(workspaceMembers.userId, userId));
      await tx.delete(projectMembers).where(eq(projectMembers.userId, userId));

      // Records the user authored/owns, regardless of whose workspace they're in.
      await tx.delete(timeEntries).where(eq(timeEntries.userId, userId));
      await tx.delete(files).where(eq(files.uploadedBy, userId));
      await tx.delete(activity).where(eq(activity.userId, userId));
      await tx.delete(notifications).where(eq(notifications.recipientId, userId));

      // Workspaces the user owns cascade-delete their clients/projects/tasks/
      // documents/activity/files/timeEntries/projectMembers/invoices via
      // existing workspaceId FK constraints.
      await tx.delete(workspaces).where(eq(workspaces.ownerId, userId));

      await tx.delete(user).where(eq(user.id, userId));
    });

    // Best-effort: clear the session cookie now that the underlying row is gone.
    try {
      await auth.api.signOut({ headers: requestHeaders });
    } catch {
      // Session row is already gone at this point, so signOut may no-op or throw — ignore.
    }

    return { success: true };
  } catch (err: any) {
    console.error("Delete account failed", err);
    return { success: false, error: "Couldn't delete your account. Try again." };
  }
}

////GoogleAuth

export async function signInGoogle() {
  console.log("google signin hit")
  try {
    const data = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/home"
    });
    console.log("Google signin success")
  } catch (err) {
    console.error("Google signin failed", err)
  }
}