"use server"

import db from "@/database";
import { activity } from "@/database/schema/schema";
import { and, eq, ne, desc } from  "drizzle-orm"

import { Activity } from "@/types/schema";

interface GetActivitiesResult {
  success: boolean;
  activities: Activity[];
  error?: string;
}

export async function NewClientActivity({clientId, projectId, userId, type= "Create Project", message}: {clientId: string, projectId: string, userId: string | undefined, type: string, message: string}) {
    console.log("new activity hit")
    try {
        const newActivity = await db.insert(activity).values({ clientId, projectId, userId, type, message, createdAt: new Date() }).returning()

        console.log("New Activity", newActivity)

    } catch (err) {
        console.error("failed to create activity", err)
    }
}

export async function NewProjectActivity({clientId, projectId, userId, type= "Create Project", message}: {clientId: string, projectId: string, userId: string | undefined, type: string, message: string}) {
    console.log("new activity hit")
    try {
        const newActivity = await db.insert(activity).values({ clientId, projectId, userId, type, message, createdAt: new Date() }).returning()

        console.log("New Activity", newActivity)

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

