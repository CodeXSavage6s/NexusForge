import { pgTable, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

/**
 * PENDING SIGNUPS
 * ------------------------------------------------------------------
 * Temporary, short-lived state for the OTP-first email/password signup
 * flow. A row here is created the moment someone submits the sign-up
 * form and is deleted/consumed the moment they successfully verify
 * their OTP (at which point the *real* Better Auth `user`/`account`
 * rows are created — see lib/actions/auth.ts::verifySignupOtp).
 *
 * IMPORTANT: this table intentionally does NOT belong to Better Auth.
 * It is not passed to `drizzleAdapter`'s schema and Better Auth never
 * reads or writes it. It exists purely so that no permanent `user` row
 * is created until the OTP has been verified.
 *
 * Security notes:
 * - `passwordEncrypted` is the user's password encrypted at rest with
 *   AES-256-GCM (see lib/security/pending-signup-crypto.ts). It is NOT
 *   plaintext, and it is NOT the same as Better Auth's own password
 *   hash — it must stay reversible because we hand the plaintext to
 *   `auth.api.signUpEmail` once the OTP is confirmed, so Better Auth's
 *   normal (scrypt) hashing pipeline creates the real credential.
 * - `otpHash`/`otpSalt` store a salted HMAC of the 6-digit OTP, never
 *   the OTP itself.
 * - `token` is a separate, unguessable opaque identifier (32 random
 *   bytes) handed to the client. The client never sees `id`, the
 *   encrypted password, or the OTP hash/salt.
 */
export const pendingSignups = pgTable(
  "pending_signups",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),

    // Opaque, unguessable reference used by the client (URL/body) to
    // resume this pending signup. Never used to look up anything else.
    token: text("token").notNull().unique(),

    // Normalized (lowercased + trimmed) email this signup is for.
    // Unique so a given email can only have one pending signup at a
    // time — a second sign-up attempt updates/reuses this row instead
    // of creating a new one (see Requirement 7B).
    email: text("email").notNull().unique(),

    name: text("name").notNull(),

    // AES-256-GCM ciphertext of the password, base64-encoded. See
    // lib/security/pending-signup-crypto.ts for the format.
    passwordEncrypted: text("password_encrypted").notNull(),

    // Salted HMAC-SHA256 of the current 6-digit OTP (hex), plus the
    // random per-record salt used to compute it.
    otpHash: text("otp_hash").notNull(),
    otpSalt: text("otp_salt").notNull(),

    // When the *current* OTP stops being acceptable.
    otpExpiresAt: timestamp("otp_expires_at").notNull(),

    // Incorrect verification attempts against the current OTP.
    otpAttempts: integer("otp_attempts").notNull().default(0),

    // Total number of OTP emails sent for this pending record (initial
    // send + resends), used to hard-cap resends alongside the cooldown.
    resendCount: integer("resend_count").notNull().default(1),

    // Used to enforce the resend cooldown window.
    lastSentAt: timestamp("last_sent_at").notNull().defaultNow(),

    // Set the instant the OTP is successfully verified, atomically
    // "claiming" this row so it can only ever be consumed once even
    // under concurrent verify requests. A consumed row is deleted
    // immediately after, but the column exists so the consume step can
    // use a conditional UPDATE ... WHERE consumed_at IS NULL as a
    // single-use guard.
    consumedAt: timestamp("consumed_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("pending_signups_email_idx").on(table.email),
    index("pending_signups_token_idx").on(table.token),
    index("pending_signups_created_at_idx").on(table.createdAt),
  ],
);
