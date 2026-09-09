"use server";

import db from "@/database/index";
import { timeEntries, projects } from "@/database/schema/schema";
import { and, desc, eq, isNull } from "drizzle-orm";
import { requireWorkspaceAccess } from "@/lib/authz";

async function assertProjectInWorkspace(workspaceId: string, projectId: string) {
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId)));

  if (!project) {
    throw new Error("Project not found in this workspace.");
  }
}

export interface TimeEntryActionResult {
  success: boolean;
  error?: string;
  timeEntry?: typeof timeEntries.$inferSelect;
}

/** The one currently-running timer (if any) for this user on this project. */
export async function GetActiveTimeEntry(
  workspaceId: string,
  projectId: string,
  userId: string
): Promise<typeof timeEntries.$inferSelect | null> {
  await requireWorkspaceAccess(workspaceId);
  await assertProjectInWorkspace(workspaceId, projectId);

  const [active] = await db
    .select()
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.projectId, projectId),
        eq(timeEntries.userId, userId),
        isNull(timeEntries.endTime)
      )
    );

  return active ?? null;
}

export async function GetProjectTimeEntries(
  workspaceId: string,
  projectId: string
): Promise<{
  success: boolean;
  entries: (typeof timeEntries.$inferSelect)[];
  totalSeconds: number;
  error?: string;
}> {
  try {
    await requireWorkspaceAccess(workspaceId);
    await assertProjectInWorkspace(workspaceId, projectId);

    const rows = await db
      .select()
      .from(timeEntries)
      .where(eq(timeEntries.projectId, projectId))
      .orderBy(desc(timeEntries.startTime));

    const totalSeconds = rows.reduce((sum, row) => sum + (row.duration ?? 0), 0);

    return { success: true, entries: rows, totalSeconds };
  } catch (err) {
    console.error("Failed to fetch time entries:", err);
    return { success: false, entries: [], totalSeconds: 0, error: "Failed to fetch time entries." };
  }
}

export async function StartTimer(
  workspaceId: string,
  projectId: string,
  userId: string,
  description?: string | null
): Promise<TimeEntryActionResult> {
  try {
    await requireWorkspaceAccess(workspaceId);
    await assertProjectInWorkspace(workspaceId, projectId);

    // Prevent a nonsensical second running timer for the same user+project.
    const existingActive = await GetActiveTimeEntry(workspaceId, projectId, userId);
    if (existingActive) {
      return { success: false, error: "A timer is already running for this project." };
    }

    const [created] = await db
      .insert(timeEntries)
      .values({
        projectId,
        userId,
        description: description?.trim() || null,
        startTime: new Date(),
        endTime: null,
        duration: null,
      })
      .returning();

    return { success: true, timeEntry: created };
  } catch (err) {
    console.error("Failed to start timer:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to start timer.",
    };
  }
}

export async function StopTimer(
  workspaceId: string,
  timeEntryId: string,
  userId: string
): Promise<TimeEntryActionResult> {
  try {
    await requireWorkspaceAccess(workspaceId);

    const [entry] = await db
      .select({
        id: timeEntries.id,
        startTime: timeEntries.startTime,
        endTime: timeEntries.endTime,
      })
      .from(timeEntries)
      .innerJoin(projects, eq(timeEntries.projectId, projects.id))
      .where(
        and(
          eq(timeEntries.id, timeEntryId),
          eq(projects.workspaceId, workspaceId),
          eq(timeEntries.userId, userId)
        )
      );

    if (!entry) {
      return { success: false, error: "Time entry not found." };
    }

    if (entry.endTime) {
      return { success: false, error: "This timer has already been stopped." };
    }

    const endTime = new Date();
    // Duration is always computed server-side from the stored startTime —
    // never trust an elapsed value from the browser's clock.
    const durationSeconds = Math.max(
      0,
      Math.round((endTime.getTime() - entry.startTime.getTime()) / 1000)
    );

    const [updated] = await db
      .update(timeEntries)
      .set({ endTime, duration: durationSeconds })
      .where(eq(timeEntries.id, timeEntryId))
      .returning();

    return { success: true, timeEntry: updated };
  } catch (err) {
    console.error("Failed to stop timer:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to stop timer.",
    };
  }
}

export async function AddManualTimeEntry(
  workspaceId: string,
  projectId: string,
  userId: string,
  input: { description?: string | null; startTime: Date; endTime: Date }
): Promise<TimeEntryActionResult> {
  try {
    await requireWorkspaceAccess(workspaceId);
    await assertProjectInWorkspace(workspaceId, projectId);

    if (input.endTime <= input.startTime) {
      return { success: false, error: "End time must be after start time." };
    }

    const durationSeconds = Math.round((input.endTime.getTime() - input.startTime.getTime()) / 1000);

    const [created] = await db
      .insert(timeEntries)
      .values({
        projectId,
        userId,
        description: input.description?.trim() || null,
        startTime: input.startTime,
        endTime: input.endTime,
        duration: durationSeconds,
      })
      .returning();

    return { success: true, timeEntry: created };
  } catch (err) {
    console.error("Failed to add manual time entry:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to add time entry.",
    };
  }
}

export async function DeleteTimeEntry(
  workspaceId: string,
  timeEntryId: string,
  userId: string
): Promise<TimeEntryActionResult> {
  try {
    await requireWorkspaceAccess(workspaceId);

    const [entry] = await db
      .select({ id: timeEntries.id })
      .from(timeEntries)
      .innerJoin(projects, eq(timeEntries.projectId, projects.id))
      .where(
        and(
          eq(timeEntries.id, timeEntryId),
          eq(projects.workspaceId, workspaceId),
          eq(timeEntries.userId, userId)
        )
      );

    if (!entry) {
      return { success: false, error: "Time entry not found." };
    }

    await db.delete(timeEntries).where(eq(timeEntries.id, timeEntryId));

    return { success: true };
  } catch (err) {
    console.error("Failed to delete time entry:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete time entry.",
    };
  }
}
