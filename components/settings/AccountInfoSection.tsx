"use client";

import { Mail, CheckCircle2, AlertCircle } from "lucide-react";

interface AccountInfoSectionProps {
  email: string;
  emailVerified: boolean | null;
  authProviders: string[];
  hasPassword: boolean;
}

export default function AccountInfoSection({
  email,
  emailVerified,
  authProviders,
  hasPassword,
}: AccountInfoSectionProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div>
        <h4 className="font-semibold mb-1">Account Information</h4>
        <p className="text-sm text-muted-foreground">
          Your email and authentication methods.
        </p>
      </div>

      <div className="space-y-3">
        {/* Email */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
          {emailVerified ? (
            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Verified
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4" />
              Unverified
            </div>
          )}
        </div>

        {/* Auth Methods */}
        <div className="pt-2 border-t border-border">
          <p className="text-sm font-medium mb-2">Sign-in Methods</p>
          <div className="flex flex-wrap gap-2">
            {hasPassword && (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Password
              </span>
            )}
            {authProviders.includes("google") && (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Google
              </span>
            )}
            {authProviders.includes("github") && (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                <span className="h-2 w-2 rounded-full bg-slate-900 dark:bg-slate-100" />
                GitHub
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
