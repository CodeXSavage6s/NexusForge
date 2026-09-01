import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

export interface ComingSoonSectionProps {
  title: string;
  icon: LucideIcon;
  description: string;
  cta?: { label: string; href: string };
}

export default function ComingSoonSection({
  title,
  icon: Icon,
  description,
  cta,
}: ComingSoonSectionProps) {
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
        <h1 className="text-2xl font-bold italic">{title}</h1>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>

        <div className="light-blue-bg w-fit rounded-full border border-blue-200 px-2 py-1 text-[10px] font-medium text-blue-600">
          <span className="inline-flex items-center gap-1">
            <Construction className="h-3 w-3" />
            Coming Soon
          </span>
        </div>

        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>

        {cta ? (
          <Button className="blue-btn btn-press" asChild>
            <Link href={cta.href} className="mt-2">
              {cta.label}
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
