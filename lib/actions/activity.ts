"use server"

import db from "@/database";
import { activity, clients } from "@/database/schema/schema";
import { eq, desc } from  "drizzle-orm"
import { requireWorkspaceAccess } from "@/lib/authz";

import { Activity } from "@/types/schema";

interface GetActivitiesResult {
  success: boolean;
  activities: Activity[];
  error?: string;
}

export async function NewClientActivity({clientId, projectId, userId, type= "Create Project", message}: {clientId: string, projectId: string, userId: string | undefined, type: string, message: string}) {
    try {
        await db.insert(activity).values({ clientId, projectId, userId, type, message, createdAt: new Date() }).returning()
    } catch (err) {
        console.error("failed to create activity", err)
    }
}

export async function NewProjectActivity({clientId, projectId, userId, type= "Create Project", message}: {clientId: string, projectId: string, userId: string | undefined, type: string, message: string}) {
    try {
        await db.insert(activity).values({ clientId, projectId, userId, type, message, createdAt: new Date() }).returning()
    } catch (err) {
        console.error("failed to create activity", err)
    }
}

export async function GetClientActivities(clientId: string): Promise<GetActivitiesResult> {
    try {
        const activities = await db.select().from(activity).where(eq(activity.clientId, clientId)).orderBy(desc(activity.createdAt))

        return {
            success: true,
            activities
        }
    } catch (err) {
        console.error("Failed to fetch activities")
        return {
            success: false,
            activities: [],
            error: "Failed to fetch client activities"
        }
    }
}

export async function GetProjectActivities(projectId: string | undefined): Promise<GetActivitiesResult> {
    try {
        const activities = await db.select().from(activity).where(eq(activity.projectId, projectId)).orderBy(desc(activity.createdAt))

        return {
            success: true,
            activities: activities
        }
    } catch (err) {
        console.error("Failed to fetch project activities")
        return {
            success: false,
            activities: [],
            error: "Failed to fetch project activities"
        }
    }
}

/**
 * Recent activity across the whole workspace, for the dashboard. Activity
 * rows only carry clientId/projectId (no workspaceId), so this joins
 * through clients to scope correctly — never skip that join, or one
 * workspace could see another's activity feed.
 */
export async function GetWorkspaceActivities(
  workspaceId: string,
  limit = 8
): Promise<GetActivitiesResult> {
  try {
    await requireWorkspaceAccess(workspaceId);

    const rows = await db
      .select({ activity })
      .from(activity)
      .innerJoin(clients, eq(activity.clientId, clients.id))
      .where(eq(clients.workspaceId, workspaceId))
      .orderBy(desc(activity.createdAt))
      .limit(limit);

    return { success: true, activities: rows.map((r) => r.activity) };
  } catch (err) {
    console.error("Failed to fetch workspace activities:", err);
    return { success: false, activities: [], error: "Failed to fetch workspace activities." };
  }
}
