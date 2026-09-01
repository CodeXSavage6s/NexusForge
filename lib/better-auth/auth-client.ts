import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Same-origin in every environment (dev, Vercel preview, production) —
  // avoids hardcoding a URL that only works locally. Falls back to an env
  // var / localhost only for the rare case this module gets evaluated
  // outside the browser (e.g. during SSR of a page that imports it).
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});