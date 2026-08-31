"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/theme-toggle";
import { JoinWaitlist } from "@/lib/actions/waitlist";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [alreadyOnList, setAlreadyOnList] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("loading");

    const result = await JoinWaitlist({ email, name, source: "waitlist_page" });

    if (!result.success) {
      setStatus("idle");
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }

    setAlreadyOnList(!!result.alreadyOnList);
    setStatus("done");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="header flex items-center justify-between border-b px-4 py-3">
        <Link href="/home" className="flex items-center">
          <Image src="/assets/logo.svg" width={200} height={250} alt="NexusForge" />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>


      <section className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div className="light-blue-bg mb-4 w-fit rounded-full border border-blue-200 px-2 py-1 text-[9px] font-medium text-blue-600">
          + NexusForge Pro
        </div>

        {status === "done" ? (
          <div className="flex max-w-sm flex-col items-center gap-3">
            <h1 className="h1">
              {alreadyOnList ? "You're already on the list!" : "You're on the list! 🎉"}
            </h1>
            <p className="text-sm text-gray-500">
              {alreadyOnList
                ? "That email is already signed up — we'll be in touch when Pro is ready."
                : "We'll email you as soon as NexusForge Pro is ready. No spam, just one note."}
            </p>
            <Link href="/" className="mt-2">
              <Button variant="outline" className="black-btn btn-press">
                Back to home
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="h1 max-w-md">
              Be the first to know when
              <br />
              <span className="text-blue-500">NexusForge Pro</span> launches
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm text-gray-500">
              Unlimited clients, unlimited projects, advanced reports, and priority support.
              Join the waitlist and we&apos;ll email you the moment it&apos;s ready.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-6 flex w-full max-w-sm flex-col gap-2 text-left"
            >
              <Input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" className="blue-btn btn-press" disabled={status === "loading"}>
                {status === "loading" ? "Joining..." : "Notify Me"}
              </Button>
            </form>

            <p className="mt-4 text-[11px] text-gray-500">
              No spam. Unsubscribe anytime. We&apos;ll only email you about Pro access.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
