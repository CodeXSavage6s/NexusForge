import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from "@/lib/actions/mails";
import db from "@/database/index";
import * as schema from "@/database/schema/auth-schema";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: false,
    baseURL: process.env.BETTER_AUTH_URL,
    resetPasswordTokenExpiresIn: 3600, // 1 hour — keep in sync with the "expires in" text in the email
    sendResetPassword: async ({ user, url }, request) => {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl: url,
        expiresInMinutes: 60,
      });
    },
    onPasswordReset: async ({ user }, request) => {
      console.log(`Password for user ${user.email} has been reset.`);
    },
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    expiresIn: 3600, // 1 hour — keep in sync with the "expires in" text in the email
    sendVerificationEmail: async ({ user, url }, request) => {
      try {
        await sendVerificationEmail({
          to: user.email,
          name: user.name,
          verificationUrl: url,
          expiresInMinutes: 60,
        });
        console.log("Verification email sent successfully!");
      } catch (error) {
        console.error("Failed to send verification email:", error);
        throw error;
      }
    },
    // Fires once the user's email is successfully verified — good spot for the welcome email.
    afterEmailVerification: async (user, request) => {
      try {
        await sendWelcomeEmail({
          to: user.email,
          name: user.name,
          loginUrl: `${process.env.BETTER_AUTH_URL}/sign-in`,
        });
        console.log("Welcome email sent successfully!");
      } catch (error) {
        // Don't throw here — verification already succeeded, a failed welcome email shouldn't break the flow.
        console.error("Failed to send welcome email:", error);
      }
    },
  },
  plugins: [nextCookies()],
});
