"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root layout error:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center text-foreground">
        <p className="text-sm font-semibold text-destructive">Error</p>
        <h1 className="mt-2 text-2xl font-bold">Something went wrong</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
          NexusForge hit an unexpected error loading this page. Please try again.
        </p>

        {error.digest ? (
          <p className="mt-2 text-xs text-muted-foreground">Reference: {error.digest}</p>
        ) : null}

        <button
          type="button"
          onClick={() => reset()}
          className="blue-btn btn-press mt-6 rounded-lg px-4 py-2 text-sm font-semibold"
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
