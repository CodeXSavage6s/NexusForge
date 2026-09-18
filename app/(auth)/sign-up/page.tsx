"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import InputField from "@/components/form/InputField";
import FooterLink from '@/components/form/FooterLink'
import { SignUpFormData } from "@/types/form";
import { startSignup } from '@/lib/actions/auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import GoogleAuth from '@/components/form/GoogleAuth'

const SignUp = () => {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>();

  const onSubmit = async (data: SignUpFormData) => {
    setError(null);

    // Never creates a Better Auth account directly — this only creates a
    // temporary pending signup and emails a one-time code. The real
    // account is created in verifySignupOtp() on the /verify-signup page,
    // once that code is confirmed.
    const response = await startSignup(data);

    if (!response.success || !response.token) {
      setError(response.error || "Something went wrong");
      return; // ← stop here, don't navigate
    }

    // The token is an opaque reference to this pending signup only — it
    // carries no password/OTP and can't be used to look up anything else.
    try {
      sessionStorage.setItem("nf_pending_signup_email", response.email ?? data.email);
    } catch {
      // sessionStorage can fail in some environments (private browsing,
      // etc.) — the verify page falls back to fetching the email by token.
    }

    router.push(`/verify-signup?token=${encodeURIComponent(response.token)}`);
  };

  return (
    <div className="flex flex-col px-4">
      <div className="space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Start-Up Your Account</h1>
          <p className="text-sm text-muted-foreground">
            Fill in your details to create an account
          </p>
        </div>

        <div>
          {error && (
            <div role="alert" aria-live="polite" className="text-center text-red-500 font-semibold mb-2">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <InputField
              name="name"
              label="Name"
              placeholder="Your full name"
              register={register}
              error={errors.name}
              validation={{
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              }}
            />
  
            <InputField
              name="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              register={register}
              error={errors.email}
              validation={{
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              }}
            />
  
            <InputField
              name="password"
              label="Password"
              type="password"
              placeholder="Create a password"
              register={register}
              error={errors.password}
              validation={{
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              }}
            />
  
            <InputField
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              register={register}
              error={errors.confirmPassword}
              validation={{
                required: "Please confirm your password",
                validate: (value: string) =>
                  value === watch("password") || "Passwords do not match",
              }}
            />
  
            <Button type="submit" className="w-full h-[45px] text-xl font-semibold" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Sign up"}
            </Button>
          </form>
          <div className="flex flex-col gap-2 w-full my-2">
            <div className="flex gap-2 justify-around items-center">
              <hr className="bg-gray-500 flex-1"/>
              <p className="">Or</p>
              <hr className="bg-gray-500 border-lg flex-1"/>
            </div>
            <GoogleAuth
            className="w-full h-[45px] text-xl font-semibold"
            auth="sign-up" />
          </div>
          
        </div>
        <FooterLink 
          text="Already have an account?"
          linkText="Sign-In"
          href="/sign-in"
        />
      </div>
    </div>
  );
};

export default SignUp;
