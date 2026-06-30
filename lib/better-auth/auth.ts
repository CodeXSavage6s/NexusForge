import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { sendEmail } from "@/lib/actions/mails"
import db from "@/database/index"; 
import * as schema from "@/database/schema/auth-schema";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),
    emailAndPassword: { 
        enabled: true, 
        requireEmailVerification: true, 
        minPasswordLength: 8,
        maxPasswordLength: 128,
        autoSignIn: true,
    }, 
    emailVerification: {
    sendOnSignUp: true, 
    sendVerificationEmail: async ({ user, url, token }, request) => {
    try {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        text: `Click the link to verify your email: ${url}`,
      });
      console.log("Verification email sent successfully!");
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  },
},

});
/*
    emailVerification: {
    sendVerificationEmail: async ( { user, url, token }, request) => {
      void sendEmail({
        to: user.email,
        subject: "Verify your email address",
        text: `Click the link to verify your email: ${url}`,
      });
    },
  },*/