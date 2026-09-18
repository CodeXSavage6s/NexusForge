"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FooterLink from "@/components/form/FooterLink";
import {
  getPendingSignupEmail,
  resendSignupOtp,
  verifySignupOtp,
} from "@/lib/actions/auth";

const RESEND_COOLDOWN_SECONDS = 60;

function VerifySignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [email, setEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const submittingRef = useRef(false);

  // Resolve which email this session is verifying — prefer the value the
  // sign-up page stashed in sessionStorage, fall back to asking the
  // server (which resolves it from the opaque token, e.g. after a
  // page refresh where sessionStorage isn't available/was cleared).
  useEffect(() => {
    let cancelled = false;

    try {
      const stored = sessionStorage.getItem("nf_pending_signup_email");
      if (stored) {
        setEmail(stored);
        return;
      }
    } catch {
      // ignore, fall through to server lookup
    }

    if (!token) return;

    getPendingSignupEmail(token).then((res) => {
      if (cancelled) return;
      if (res.success && res.email) {
        setEmail(res.email);
      } else {
        setError(res.error ?? "This signup session has expired.");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [token]);

  // Resend cooldown countdown, starts once the page loads (a code was
  // just sent by the sign-up page) and after every successful resend.
  useEffect(() => {
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current) return;

    setError(null);

    if (!token) {
      setError("This verification link is invalid. Please sign up again.");
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    submittingRef.current = true;
    setIsVerifying(true);
    try {
      const result = await verifySignupOtp({ token, otp });
      if (!result.success) {
        setError(result.error ?? "Something went wrong. Please try again.");
        return;
      }

      try {
        sessionStorage.removeItem("nf_pending_signup_email");
      } catch {
        // no-op
      }

      router.push(result.redirectTo ?? "/home");
    } finally {
      submittingRef.current = false;
      setIsVerifying(false);
    }
  }

  async function handleResend() {
    if (!token || cooldown > 0 || isResending) return;

    setError(null);
    setResendMessage(null);
    setIsResending(true);
    try {
      const result = await resendSignupOtp(token);
      if (!result.success) {
        setError(result.error ?? "Couldn't resend the code.");
        if (result.cooldownSeconds) setCooldown(result.cooldownSeconds);
        return;
      }
      setOtp("");
      setResendMessage("A new code is on its way.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="flex flex-col px-4">
      <div className="space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Verify your email</h1>
          <p className="text-sm text-muted-foreground min-h-[20px]">
            {email
              ? <>Enter the 6-digit code we sent to <span className="font-medium text-foreground">{email}</span>.</>
              : "Enter the 6-digit code we sent to your email."}
          </p>
        </div>

        <div>
          <div className="min-h-[28px] mb-2">
            {error && (
              <div role="alert" aria-live="polite" className="text-center text-red-500 font-semibold">
                {error}
              </div>
            )}
            {!error && resendMessage && (
              <div role="status" aria-live="polite" className="text-center text-muted-foreground text-sm">
                {resendMessage}
              </div>
            )}
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <Label htmlFor="otp" className="mb-2">
                Verification code
              </Label>
              <Input
                id="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d*"
                maxLength={6}
                placeholder="123456"
                value={otp}
                disabled={isVerifying}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="p-2 h-[45px] text-center text-2xl tracking-[0.5em] font-mono"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-[45px] text-xl font-semibold"
              disabled={isVerifying || otp.length !== 6}
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </Button>
          </form>

          <div className="text-center pt-4">
            <p className="text-sm text-gray-500">
              Didn&apos;t get a code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || isResending}
                className="footer-link disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
              >
                {isResending
                  ? "Sending..."
                  : cooldown > 0
                    ? `Resend code (${cooldown}s)`
                    : "Resend code"}
              </button>
            </p>
          </div>
        </div>

        <FooterLink text="Wrong email?" linkText="Start over" href="/sign-up" />
      </div>
    </div>
  );
}

export default function VerifySignup() {
  return (
    <Suspense fallback={null}>
      <VerifySignupForm />
    </Suspense>
  );
}
