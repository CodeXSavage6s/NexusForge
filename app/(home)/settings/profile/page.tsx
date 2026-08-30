import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import db from "@/database/index";
import { user as userTable, account } from "@/database/schema/auth-schema";
import { workspaces, clients, projects } from "@/database/schema/schema";
import { eq, count } from "drizzle-orm";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Mail,
  Pencil,
  ShieldCheck,
} from "lucide-react";

import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect("/sign-in");

  const [dbUser] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, session.user.id));

  if (!dbUser) redirect("/sign-in");

  const accounts = await db
    .select({
      providerId: account.providerId,
      password: account.password,
    })
    .from(account)
    .where(eq(account.userId, session.user.id));

  const hasPassword = accounts.some(
    (a) => a.providerId === "credential" && !!a.password
  );

  const [workspaceStats] = await db
    .select({ count: count() })
    .from(workspaces)
    .where(eq(workspaces.ownerId, session.user.id));

  const [clientStats] = await db
    .select({ count: count() })
    .from(clients)
    .innerJoin(workspaces, eq(clients.workspaceId, workspaces.id))
    .where(eq(workspaces.ownerId, session.user.id));

  const [projectStats] = await db
    .select({ count: count() })
    .from(projects)
    .innerJoin(workspaces, eq(projects.workspaceId, workspaces.id))
    .where(eq(workspaces.ownerId, session.user.id));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
        <div className="flex">
          <Link
          aria-label="Back to Settings"
          href="/settings"
          className="rounded-lg p-2 hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
          <h1 className="text-2xl font-bold italic">Profile</h1>
        </div>
          <p className="text-sm text-muted-foreground">
            Your NexusForge account overview.
          </p>
        </div>

        <Link
          href="/settings/profile/edit"
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition hover:bg-muted"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
      </div>

      <ProfileHeader
        name={dbUser.name}
        email={dbUser.email}
        image={dbUser.image}
        emailVerified={dbUser.emailVerified}
        createdAt={dbUser.createdAt}
        hasPassword={hasPassword}
      />

      <ProfileStats
        workspaceCount={workspaceStats.count}
        clientCount={clientStats.count}
        projectCount={projectStats.count}
      />

      {/* Account information */}
      <section className="rounded-2xl border bg-card p-5">
        <div className="mb-5">
          <h2 className="text-xl font-semibold">Account</h2>
          <p className="text-sm text-muted-foreground">
            Information associated with your NexusForge account.
          </p>
        </div>

        <div className="divide-y">
          <div className="flex items-center gap-4 py-4">
            <Mail className="h-5 w-5 text-muted-foreground" />

            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="truncate font-medium">{dbUser.email}</p>
            </div>

            {dbUser.emailVerified && (
              <span className="flex items-center gap-1 text-sm text-green-500">
                <CheckCircle2 className="h-4 w-4" />
                Verified
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 py-4">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />

            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">
                Account security
              </p>
              <p className="font-medium">
                {hasPassword
                  ? "Password authentication enabled"
                  : "Social authentication"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 py-4">
            <KeyRound className="h-5 w-5 text-muted-foreground" />

            <div>
              <p className="text-sm text-muted-foreground">Member since</p>
              <p className="font-medium">
                {new Intl.DateTimeFormat("en", {
                  month: "long",
                  year: "numeric",
                }).format(dbUser.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="rounded-2xl border bg-card p-5">
        <h2 className="text-xl font-semibold">Account actions</h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href="/settings/profile/edit"
            className="rounded-xl border p-4 transition hover:bg-muted"
          >
            <p className="font-semibold">Edit profile</p>
            <p className="text-sm text-muted-foreground">
              Change your name or profile picture.
            </p>
          </Link>

          <Link
            href="/settings"
            className="rounded-xl border p-4 transition hover:bg-muted"
          >
            <p className="font-semibold">Account settings</p>
            <p className="text-sm text-muted-foreground">
              Manage your NexusForge preferences.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}