"use server"

import {auth} from '@/lib/better-auth/auth'
import { headers } from 'next/headers'

export async function signUp ({ name, email, password }) {
  try {
    const data = await auth.api.signUpEmail({ 
      body: { name, email, password, callBackUrl: "/", },
});
  
  return { success: true, data };
  } catch(err) {
    console.error("Sign Up Failed", err);
    return { success: false, error: "Sign Up Failed" };
  }
}

export async function signIn ({ email, password }) {
  try {
    const data = await auth.api.signInEmail({
      body: { email, password, callbackURL: "/", },
      headers: await headers(),
  });
    return { success: true, data };
  } catch(err) {
    console.error("Sign-In Failed", err);
    return { success: false, error: "Filed to Sign-In" };
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
