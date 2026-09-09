"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Clock, Play, Square, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  StartTimer,
  StopTimer,
  AddManualTimeEntry,
  DeleteTimeEntry,
} from "@/lib/actions/time-entry";

interface TimeEntryItem {
  id: string;
  description: string | null;
  startTime: Date | string;
  endTime: Date | string | null;
  duration: number | null;
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatDateTime(date: Date | string) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function toDatetimeLocal(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export default function ProjectTimeTracker({
  workspaceId,
  projectId,
  userId,
  initialActiveEntry,
  initialEntries,
  initialTotalSeconds,
}: {
  workspaceId: string;
  projectId: string;
  userId: string;
  initialActiveEntry: TimeEntryItem | null;
  initialEntries: TimeEntryItem[];
  initialTotalSeconds: number;
}) {
  const router = useRouter();
  const [activeEntry, setActiveEntry] = useState(initialActiveEntry);
  const [entries, setEntries] = useState(initialEntries);
  const [totalSeconds, setTotalSeconds] = useState(initialTotalSeconds);
  const [description, setDescription] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!activeEntry) {
      setElapsed(0);
      return;
    }
    const start = new Date(activeEntry.startTime).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeEntry]);

  async function handleStart() {
    setIsBusy(true);
    const result = await StartTimer(workspaceId, projectId, userId, description || null);
    setIsBusy(false);
    if (!result.success || !result.timeEntry) {
      toast.error(result.error ?? "Failed to start timer.");
      return;
    }
    setActiveEntry(result.timeEntry);
    setDescription("");
    router.refresh();
  }

  async function handleStop() {
    if (!activeEntry) return;
    setIsBusy(true);
    const result = await StopTimer(workspaceId, activeEntry.id, userId);
    setIsBusy(false);
    if (!result.success || !result.timeEntry) {
      toast.error(result.error ?? "Failed to stop timer.");
      return;
    }
    setActiveEntry(null);
    setEntries((prev) => [result.timeEntry!, ...prev]);
    setTotalSeconds((prev) => prev + (result.timeEntry!.duration ?? 0));
    toast.success("Timer stopped.");
    router.refresh();
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this time entry?");
    if (!confirmed) return;

    const entry = entries.find((e) => e.id === id);
    const result = await DeleteTimeEntry(workspaceId, id, userId);
    if (!result.success) {
      toast.error(result.error ?? "Failed to delete entry.");
      return;
    }
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setTotalSeconds((prev) => prev - (entry?.duration ?? 0));
    router.refresh();
  }

  async function handleManualSubmit(formData: FormData) {
    setManualError(null);
    const desc = String(formData.get("description") ?? "");
    const start = String(formData.get("start") ?? "");
    const end = String(formData.get("end") ?? "");

    const startDate = new Date(start);
    const endDate = new Date(end);

    const result = await AddManualTimeEntry(workspaceId, projectId, userId, {
      description: desc || null,
      startTime: startDate,
      endTime: endDate,
    });

    if (!result.success || !result.timeEntry) {
      setManualError(result.error ?? "Failed to add entry.");
      return;
    }

    setEntries((prev) => [result.timeEntry!, ...prev]);
    setTotalSeconds((prev) => prev + (result.timeEntry!.duration ?? 0));
    setManualOpen(false);
    toast.success("Time entry added.");
    router.refresh();
  }

  const now = new Date();
  const defaultEnd = toDatetimeLocal(now);
  const defaultStart = toDatetimeLocal(new Date(now.getTime() - 60 * 60 * 1000));

  return (
    <div className="space-y-3 rounded-md border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Clock className="h-4 w-4" />
          Time tracked: {formatDuration(totalSeconds + (activeEntry ? elapsed : 0))}
        </div>

        <Dialog open={manualOpen} onOpenChange={setManualOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <Plus className="mr-1 h-3.5 w-3.5" />
              Manual entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Add time entry</DialogTitle>
            </DialogHeader>
            <form action={handleManualSubmit} className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" placeholder="What did you work on?" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="start">Start</Label>
                <Input id="start" name="start" type="datetime-local" defaultValue={defaultStart} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end">End</Label>
                <Input id="end" name="end" type="datetime-local" defaultValue={defaultEnd} required />
              </div>
              {manualError ? <p className="text-sm text-destructive">{manualError}</p> : null}
              <DialogFooter>
                <Button type="submit">Add entry</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {activeEntry ? (
        <div className="flex flex-col gap-2 rounded-md bg-muted/50 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">
              Running{activeEntry.description ? `: ${activeEntry.description}` : ""}
            </p>
            <p className="text-xs text-muted-foreground">Started {formatDateTime(activeEntry.startTime)}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm tabular-nums">{formatDuration(elapsed)}</span>
            <Button type="button" size="sm" variant="destructive" onClick={handleStop} disabled={isBusy}>
              <Square className="mr-1 h-3.5 w-3.5" />
              Stop
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="What are you working on? (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button type="button" onClick={handleStart} disabled={isBusy}>
            <Play className="mr-1.5 h-4 w-4" />
            Start timer
          </Button>
        </div>
      )}

      {entries.length > 0 ? (
        <div className="divide-y divide-border border-t border-border pt-2">
          {entries.slice(0, 8).map((entry) => (
            <div key={entry.id} className="flex items-center justify-between gap-2 py-2 text-sm">
              <div className="min-w-0">
                <p className="truncate">{entry.description || "No description"}</p>
                <p className="text-xs text-muted-foreground">{formatDateTime(entry.startTime)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="tabular-nums text-muted-foreground">
                  {formatDuration(entry.duration ?? 0)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(entry.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : !activeEntry ? (
        <p className="pt-1 text-xs text-muted-foreground">No time logged yet for this project.</p>
      ) : null}
    </div>
  );
}
