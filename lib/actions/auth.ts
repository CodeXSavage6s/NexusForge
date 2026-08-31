// "use server"

// import { auth } from '@/lib/better-auth/auth'
// import { headers } from 'next/headers'
// import db from "@/database/index";
// import { user } from "@/database/schema/auth-schema";
// import { eq } from "drizzle-orm";
// import { authClient } from '@/lib/better-auth/auth-client'

// export async function signUp({ name, email, password }: { name: string; email: string; password: string }) {

//   const existing = await db.select().from(user).where(eq(user.email, email)).limit(1);
//   if (existing.length > 0) {
//     return { success: false as const, error: "An account with this email already exists" };
//   }

//   try {
//     const data = await auth.api.signUpEmail({
//       body: { name, email, password },
//       headers: await headers(),
//     });
    
//     console.log("SignUp success:", data);
//     return { success: true as const, data };
//   } catch (err: any) {
//     console.error("Sign Up Failed", err);
    
//     const message = err?.message || err?.body?.message || "Sign-Up Failed";
//     return { success: false as const, error: message };
//   }
// }

// export async function signIn({ email, password }: { email: string; password: string }) {
//   try {
//     const data = await auth.api.signInEmail({
//       body: { email, password },
//       headers: await headers(),
//     });
//     return { success: true as const, data };
//   } catch (err: any) {
//     console.error("Sign In Failed", err);
    
//     const message = err?.message || err?.body?.message || "Failed to sign in";
//     return {
//       success: false as const,
//       error: message,
//     };
//   }
// }

// export async function signOut() {
//   try {
//     await auth.api.signOut({
//       headers: await headers(),
//     });
//     console.log("signed out");
//     return { success: true as const };
//   } catch (err: any) {
//     console.error("sign out failed", err);
//     return { success: false as const, error: err?.message || "Sign out failed" };
//   }
// }

// ////GoogleAuth

// export async function signInGoogle() {
//   console.log("google signin hit")
//   try {
//     const data = await authClient.signIn.social({
//       provider: "google",
//       callbackURL: "/home"
//     });
//     console.log("Google signin success")
//   } catch (err) {
//     console.error("Google signin failed", err)
//   }
// }

"use server"

import { auth } from '@/lib/better-auth/auth'
import { headers } from 'next/headers'
import db from "@/database/index";
import { user, account } from "@/database/schema/auth-schema";
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
import { eq } from "drizzle-orm";
import { authClient } from '@/lib/better-auth/auth-client'

export async function signUp({ name, email, password }: { name: string; email: string; password: string }) {

  const existing = await db.select().from(user).where(eq(user.email, email)).limit(1);
  if (existing.length > 0) {
    return { success: false as const, error: "An account with this email already exists" };
  }

  try {
    const data = await auth.api.signUpEmail({
      body: { name, email, password },
      headers: await headers(),
    });
    
    console.log("SignUp success:", data);
    return { success: true as const, data };
  } catch (err: any) {
    console.error("Sign Up Failed", err);
    
    const message = err?.message || err?.body?.message || "Sign-Up Failed";
    return { success: false as const, error: message };
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