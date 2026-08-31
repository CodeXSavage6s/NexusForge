import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { hasPasswordAccount } from "@/lib/actions/auth";
import PasswordSection from "@/components/settings/PasswordSection";

export const metadata = { title: "Security | NexusForge" };

export default async function SecuritySettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const canChangePassword = await hasPasswordAccount(session.user.id);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-3">
      <div className="flex items-center gap-2">
        <Link
          aria-label="Back to Settings"
          href="/settings/"
          className="rounded-lg p-2 hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold italic">Security</h1>
      </div>

      {canChangePassword ? (
        <PasswordSection />
      ) : (
        <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <KeyRound className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h4 className="font-semibold">Password</h4>
            <p className="text-sm text-muted-foreground">
              You signed in with Google, so there&apos;s no NexusForge password to manage.
              Manage your login from your Google account instead.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-dashed border-border p-4">
        <h4 className="font-semibold">Sessions & Login History</h4>
        <p className="text-sm text-muted-foreground">
          Viewing and revoking active sessions is on the way.
        </p>
      </div>
    </div>
  );
}
