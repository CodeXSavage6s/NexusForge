"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/theme-toggle";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="header flex items-center justify-between border-b px-4 py-3">
        <Link href="/" className="flex items-center">
          <Image src="/assets/logo.svg" width={170} height={60} alt="NexusForge" />
        </Link>
        <ThemeToggle />
      </header>

      <section className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-sm font-semibold text-destructive">Error</p>
        <h1 className="h1 mt-2 max-w-md">Something went wrong</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-gray-500">
          An unexpected error occurred. You can try again, or head back to the homepage.
        </p>

        {error.digest ? (
          <p className="mt-2 text-xs text-muted-foreground">Reference: {error.digest}</p>
        ) : null}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => reset()} className="blue-btn btn-press w-full">
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" className="black-btn btn-press w-full">
              Back to Home
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
