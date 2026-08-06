"use server"

import db from "@/database";
import { tasks } from "@/database/schema/schema";
import { Task } from "@/types/schema";
import { eq } from "drizzle-orm"

type TASK = {
    success: boolean,
    tasks?: Task[]
    error?: string
    message?: unknown
}

export async function GetTask(projectId: string): Promise<TASK> {
    try {
        const Tasks = await db.select().from(tasks).where(eq(tasks.projectId, projectId))

        return {
            success: true,
            tasks: Tasks
        }
    } catch(err) {
        console.error("Failed to get task")
        return {
            success: false,
            error: "Failed to get task",
            message: err instanceof Error ? err.message : String(err)
        }
    }
}

export async function CreateTask({ projectId, title, description }: { projectId: string; title: string; description: string }) {
    try {
        const [newTask] = await db.insert(tasks).values({ projectId, title, description, status: "TODO", priority: "MEDIUM", position: 0, createdAt: new Date(), updatedAt: new Date() }).returning();
        
        return {
            success: true,
            task: newTask
        };
    } catch (error) {
        console.error("Create task failed:", error);
        return {
            success: false,
            error: "Failed to create task"
        };
    }
}   