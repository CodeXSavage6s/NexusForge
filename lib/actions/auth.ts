"use server"

import {auth} from '@/lib/better-auth/auth'
import { headers } from 'next/headers'

export async function signUp ({ name, email, password }) {
  try {
    const data = await auth.api.signUpEmail({ 
      body: { name, email, password, callBackUrl: "/dashboard", },
});
  
  return { success: true, data };
  } catch(err) {
    console.error("Sign Up Failed", err);
    return { success: false, error: err?.body?.message || "Sign-Up Failed" };
  }
}

export async function signIn({ email, password }) {
  try {
    const data = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
    return { success: true as const };
  } catch (err: any) {
    const message = err?.body?.message ?? "Failed to sign in"
    return { success: false as const, error: String(message) };
  }
}

export async function signOut() {
  try {
    await auth.api.signOut({
      headers: await headers(),
});
    console.log("signed out")
  } catch(err) {
    console.error("sign out failed", err)
  }
}
