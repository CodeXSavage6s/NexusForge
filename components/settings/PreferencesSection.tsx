"use client";

import { useTheme } from "@/lib/context/theme-provider";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PreferencesSection() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div>
        <h4 className="font-semibold">Appearance</h4>
        <p className="text-sm text-muted-foreground">
          Choose how NexusForge looks on this device.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
            theme === "light"
              ? "border-ring bg-secondary text-secondary-foreground"
              : "border-border hover:bg-muted"
          )}
        >
          <Sun className="h-4 w-4" /> Light
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
            theme === "dark"
              ? "border-ring bg-secondary text-secondary-foreground"
              : "border-border hover:bg-muted"
          )}
        >
          <Moon className="h-4 w-4" /> Dark
        </button>
      </div>
    </div>
  );
}
