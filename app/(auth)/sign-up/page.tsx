"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import InputField from "@/components/form/InputField";
import FooterLink from '@/components/form/FooterLink'

import { SignUpFormData } from "@/types/form";
import { signUp } from '@/lib/actions/auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

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
  
  const response = await signUp(data);
  
  console.log("signUp response:", response); 

  if (!response.success) {
    setError(response.error || "Something went wrong");
    return; // ← stop here, don't redirect
  }
  
  setError(null);
  router.push("/dashboard");
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
