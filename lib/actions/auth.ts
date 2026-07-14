"use server"

import { auth } from '@/lib/better-auth/auth'
import { headers } from 'next/headers'
import db from "@/database/index";
import { user } from "@/database/schema/auth-schema";
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

////GoogleAuth

export async function signInGoogle() {
  console.log("google signin hit")
  try {
    const data = await authClient.signIn.social({
      provider: "google",
    });
    console.log("Google signin success")
  } catch (err) {
    console.error("Google signin failed", err)
  }
}