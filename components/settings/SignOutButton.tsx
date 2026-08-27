"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/lib/actions/auth";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
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
  );
}
