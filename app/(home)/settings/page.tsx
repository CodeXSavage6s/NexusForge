"use client";

import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import { signOut } from "@/lib/actions/auth";

import {
  Bell,
  Building2,
  ChevronRight,
  CreditCard,
  LogOut,
  Palette,
  Shield,
  UserRound,
} from "lucide-react";

const settings = [
  {
    title: "My Account",
    description: "Personal information and account details.",
    href: "/settings/profile",
    icon: UserRound,
  },
  {
    title: "Workspace",
    description: "Manage your workspace and members.",
    href: "/settings/workspace",
    icon: Building2,
  },
  {
    title: "Notifications",
    description: "Choose which alerts NexusForge sends you.",
    href: "/settings/notifications",
    icon: Bell,
  },
  {
    title: "Security",
    description: "Password, sessions and account security.",
    href: "/settings/security",
    icon: Shield,
  },
  {
    title: "Plan & Usage",
    description: "View your plan and workspace limits.",
    href: "/settings/billing",
    icon: CreditCard,
  },
];

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-3">
      <div>
        <h1 className="text-3xl font-bold italic">Settings</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and NexusForge preferences.
        </p>
      </div>

      <div className="grid gap-3">
        {settings.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className="group flex items-center gap-4 rounded-2xl border bg-card p-4 transition hover:bg-muted/50"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">{item.title}</h2>

                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>

              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          );
        })}
      </div>

      <section className="rounded-2xl border bg-card p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
            <Palette className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <h2 className="font-semibold">Appearance</h2>

            <p className="text-sm text-muted-foreground">
              Choose how NexusForge looks.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <ThemeToggle />
        </div>
      </section>

      <section className="border-t pt-5">
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-xl p-3 text-left text-destructive transition hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" />

          <div>
            <p className="font-semibold">Sign out</p>

            <p className="text-sm opacity-80">
              Sign out of this NexusForge account.
            </p>
          </div>
        </button>
      </section>
    </div>
  );
}