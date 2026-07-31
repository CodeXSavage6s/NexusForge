"use server"

import db from "@/database";
import { activity } from "@/database/schema/schema";
import { success } from "better-auth";
import { and, eq, ne, } from  "drizzle-orm"

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

export async function NewClientActivity() {
    try {

    } catch (err) {

    }
}

export async function NewProjectActivity() {
    try {

    } catch (err) {

    }
}

export async function GetClientActivities(clientId: string) {
    try {
        const activities = await db.select().from(activity).where(eq(activity.clientId, clientId))

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

export async function GetProjectActivities(projectId: string) {
    try {

    } catch (err) {

    }
}

