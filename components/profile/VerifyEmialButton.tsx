"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resendVerificationEmail } from "@/lib/actions/auth";

const COOLDOWN_SECONDS = 30;

export default function VerifyEmailButton() {
  const [isPending, setIsPending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleClick() {
    setIsPending(true);
    const result = await resendVerificationEmail();
    setIsPending(false);

    if (!result.success) {
      toast.error(result.error ?? "Failed to send verification email.");
      return;
    }

    toast.success("Verification email sent — check your inbox.");
    setCooldown(COOLDOWN_SECONDS);
  }

  const disabled = isPending || cooldown > 0;

  return (
    <Button
      type="button"
      size="sm"
      onClick={handleClick}
      disabled={disabled}
      className="bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-60"
    >
      <Mail className="h-4 w-4" />
      {isPending ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Get Verified"}
    </Button>
  );
}
