"use server"

import db from "@/database";
import { activity } from "@/database/schema/schema";
import { success } from "better-auth";
import { and, eq, ne, desc } from  "drizzle-orm"

interface Activities {
 success: boolean;
 activities: {
 id: string;
 clientId: string;
 projectId: string;
 userId: string;
 type: string;
 message: string;
 metadata: unknown;
 createdAt: Date;
 }[];
 error?: undefined;
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

export async function GetClientActivities(clientId: string) {
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
            error: "Failed to fetch client activities"
        }
    }
}

export async function GetProjectActivities(projectId: string | undefined) {
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
            error: "Failed to fetch project activities"
        }
    }
}

