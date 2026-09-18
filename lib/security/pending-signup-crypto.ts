import "server-only";

import crypto from "crypto";

/**
 * Security primitives for the OTP-first signup flow.
 * ------------------------------------------------------------------
 * Two distinct things are protected here, on purpose with different
 * mechanisms:
 *
 * 1. The user's chosen PASSWORD must be retained (briefly) so that once
 *    the OTP is verified we can hand it to `auth.api.signUpEmail` and
 *    let Better Auth hash it exactly the way it hashes every other
 *    password. That means it must be reversible, so we use AES-256-GCM
 *    (authenticated encryption) with a server-only key — never
 *    plaintext at rest, but recoverable by the server for the single
 *    moment it's needed.
 *
 * 2. The OTP itself never needs to be recovered — only compared — so
 *    it's stored as a salted HMAC-SHA256 digest and compared with a
 *    timing-safe check. There's no reversing it back to the 6 digits.
 */

const ENCRYPTION_ALGO = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit nonce, recommended for GCM
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const raw = process.env.PENDING_SIGNUP_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "Missing PENDING_SIGNUP_ENCRYPTION_KEY environment variable. " +
        "Generate one with `openssl rand -hex 32` and set it in your environment."
    );
  }

  // Accept a 64-char hex string (32 bytes) — the format `openssl rand -hex 32` produces.
  const key = /^[0-9a-fA-F]{64}$/.test(raw) ? Buffer.from(raw, "hex") : Buffer.from(raw, "base64");

  if (key.length !== 32) {
    throw new Error(
      "PENDING_SIGNUP_ENCRYPTION_KEY must decode to exactly 32 bytes (a 64-character hex string is recommended)."
    );
  }

  return key;
}

/**
 * Encrypts a plaintext password for temporary storage in the
 * `pending_signups` table. Returns a single base64 string encoding
 * iv + authTag + ciphertext. Never logs or returns the plaintext.
 */
export function encryptPendingPassword(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGO, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, ciphertext]).toString("base64");
}

/**
 * Decrypts a value produced by `encryptPendingPassword`. Throws if the
 * ciphertext has been tampered with (GCM authentication failure) or the
 * key doesn't match.
 */
export function decryptPendingPassword(payload: string): string {
  const key = getEncryptionKey();
  const raw = Buffer.from(payload, "base64");

  const iv = raw.subarray(0, IV_LENGTH);
  const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = raw.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGO, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

/**
 * Generates a cryptographically secure 6-digit numeric OTP, e.g. "042917".
 * Uses crypto.randomInt (a CSPRNG), not Math.random.
 */
export function generateNumericOtp(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

/**
 * Generates the opaque, unguessable reference handed to the client to
 * identify a pending signup (in the URL / request body). 256 bits of
 * entropy — not a database id, not derived from the email.
 */
export function generatePendingSignupToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Hashes an OTP for storage. Returns { hash, salt } — both are safe to
 * store; neither can be reversed back to the OTP. A server-side pepper
 * (BETTER_AUTH_SECRET, already required by this project) is mixed in so
 * that a database-only leak isn't enough to offline-brute-force OTPs.
 */
export function hashOtp(otp: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = computeOtpHash(otp, salt);
  return { hash, salt };
}

/** Timing-safe comparison of a candidate OTP against a stored hash/salt. */
export function verifyOtp(candidate: string, hash: string, salt: string): boolean {
  const candidateHash = computeOtpHash(candidate, salt);
  const a = Buffer.from(candidateHash, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function computeOtpHash(otp: string, salt: string): string {
  const pepper = process.env.BETTER_AUTH_SECRET ?? "";
  return crypto.createHmac("sha256", salt + pepper).update(otp).digest("hex");
}
