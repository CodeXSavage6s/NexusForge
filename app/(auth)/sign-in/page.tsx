"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import InputField from "@/components/form/InputField";
import FooterLink from '@/components/form/FooterLink'
import { SignInFormData } from "@/types/form";
import { signIn } from '@/lib/actions/auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const SignIn = () => {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>();

  const onSubmit = async (data: SignInFormData) => {
  setError(null)
  const response = await signIn(data)
  console.log("RESPONSE:", response)        // add this
  console.log("ERROR VALUE:", response.error) // and this
  if (response.success) {
    setError(null)
    router.push("/")
  } else {
    setError(response.error)
  }
};

  return (
    <div className="flex flex-col px-4">
      <div className="space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Sign in to your account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and password to continue
          </p>
        </div>

        <div>
          {error && (
            <div className="text-center text-red-500 font-semibold mb-2">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              placeholder="Enter your password"
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

            <Button type="submit" className="w-full h-[45px] text-xl font-semibold" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>
        <FooterLink
          text="Don't have an account?"
          linkText="Sign-Up"
          href="/sign-up"
        />
      </div>
    </div>
  );
};

export default SignIn;
