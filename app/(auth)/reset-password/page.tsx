"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/actions/auth";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = newPassword.length >= 8 && newPassword === confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setIsSubmitting(true);
    const result = await resetPassword({ token, newPassword });
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Failed to reset your password.");
      return;
    }

    toast.success("Password reset. Please sign in.");
    router.push("/sign-in");
  }

  if (!token) {
    return (
      <div className="flex flex-col px-4">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Invalid reset link</h1>
          <p className="text-sm text-muted-foreground">
            This password reset link is missing or invalid. Request a new one below.
          </p>
          <Link href="/forgot-password" className="footer-link text-sm">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-4">
      <div className="space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Reset your password</h1>
          <p className="text-sm text-muted-foreground">Choose a new password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div role="alert" aria-live="polite" className="text-center text-red-500 font-semibold mb-2">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="new-password" className="mb-2">
              New password
            </Label>
            <Input
              id="new-password"
              type="password"
              placeholder="At least 8 characters"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="p-2 h-[45px]"
            />
          </div>

          <div>
            <Label htmlFor="confirm-password" className="mb-2">
              Confirm new password
            </Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Re-enter your new password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="p-2 h-[45px]"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-[45px] text-xl font-semibold"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
