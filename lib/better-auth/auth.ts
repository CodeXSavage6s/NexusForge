import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { sendEmail } from "@/lib/actions/mails";
import db from "@/database/index"; 
import * as schema from "@/database/schema/auth-schema";
import { nextCookies} from "better-auth/next-js";

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
        sendResetPassword: async ({ user, url, token }, request) => {
            await sendEmail({
                to: user.email,
                subject: "Reset your password",
                text: `Click the link to reset your password: ${url}`,
            });
        },
        onPasswordReset: async ({ user }, request) => {
            console.log(`Password for user ${user.email} has been reset.`);
        },
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
                throw error;
            }
        },
    },
    plugins: [nextCookies()],
});
