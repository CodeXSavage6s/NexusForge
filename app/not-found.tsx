import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/theme-toggle";

export const metadata = {
  title: "Page Not Found | NexusForge",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="header flex items-center justify-between border-b px-4 py-3">
        <Link href="/home" className="flex items-center">
          <Image src="/assets/logo.svg" width={170} height={60} alt="NexusForge" />
        </Link>
        <ThemeToggle />
      </header>

      <section className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-sm font-semibold text-blue-500">404</p>
        <h1 className="h1 mt-2 max-w-md">This page doesn&apos;t exist</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-gray-500">
          The page you&apos;re looking for may have been moved, renamed, or never existed.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button className="blue-btn btn-press w-full" asChild>
            <Link href="/home">
              Back to Home
            </Link>
          </Button>
          <Button variant="outline" className="black-btn btn-press w-full" asChild>
            <Link href="/dashboard">
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
