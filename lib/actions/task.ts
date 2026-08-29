"use server"

import db from "@/database";
import { tasks } from "@/database/schema/schema";
import { Task, TaskStatus } from "@/types/schema";
import { success } from "better-auth";
import { error } from "console";
import { eq } from "drizzle-orm"
import { NewProjectActivity } from "./activity";
import { syncProjectProgress } from "./project";

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

        await syncProjectProgress(projectId);

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

export async function ToggleTask({ taskId, clientId, projectId, userId }: {
    taskId: string; clientId: string; projectId: string; userId: string | undefined
}) {
    try {
        const [current] = await db.select().from(tasks).where(eq(tasks.id, taskId));

        if (!current) {
            return {
                success: false,
                error: "Task not found"
            };
        }

        // Tasks move through TODO -> IN_PROGRESS -> REVIEW -> DONE, not just TODO/DONE.
        // Toggling "done" off shouldn't wipe that progress back to TODO, so it drops
        // back to IN_PROGRESS instead. Use UpdateTask if you need to set an exact status.
        const nextStatus: TaskStatus = current.status === "DONE" ? "IN_PROGRESS" : "DONE";

        const [updated] = await db
            .update(tasks)
            .set({ status: nextStatus, updatedAt: new Date() })
            .where(eq(tasks.id, taskId))
            .returning();

        const newActivity = await NewProjectActivity({
            message: `Marked Task "${updated?.title ?? "task"}" as ${nextStatus === "DONE" ? "done" : "not done"}`,
            clientId,
            projectId,
            userId,
            type: "Toggle Task"
        });

        await syncProjectProgress(projectId);

        return {
            success: true,
            task: updated,
            newActivity
        };
    } catch (err) {
        console.error("Failed to toggle task", err);
        return {
            success: false,
            error: "Failed to toggle task"
        };
    }
}

export async function UpdateTask({ taskId, clientId, projectId, userId, title, description, status }: {
    taskId: string;
    clientId: string;
    projectId: string;
    userId: string | undefined;
    title?: string;
    description?: string;
    status?: TaskStatus;
}) {
    try {
        const updates: Partial<typeof tasks.$inferInsert> = { updatedAt: new Date() };
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (status !== undefined) updates.status = status;

        const [updated] = await db
            .update(tasks)
            .set(updates)
            .where(eq(tasks.id, taskId))
            .returning();

        if (!updated) {
            return {
                success: false,
                error: "Task not found"
            };
        }

        const newActivity = await NewProjectActivity({
            message: status !== undefined
                ? `Updated Task "${updated.title}" to ${status.replace("_", " ")}`
                : `Updated Task "${updated.title}"`,
            clientId,
            projectId,
            userId,
            type: "Update Task"
        });

        if (status !== undefined) {
            await syncProjectProgress(projectId);
        }

        return {
            success: true,
            task: updated,
            newActivity
        };
    } catch (err) {
        console.error("Failed to update task", err);
        return {
            success: false,
            error: "Failed to update task"
        };
    }
}

export async function DeleteTask({taskId, clientId, projectId, userId}: {
    taskId: string; clientId: string; projectId: string; userId: string | undefined
}) {
    try {
        const [deleted] = await db.delete(tasks).where(eq(tasks.id, taskId)).returning()

        const newActivity = await NewProjectActivity({
            message: `Deleted Task "${deleted?.title ?? "task"}"`,
            clientId,
            projectId,
            userId,
            type: "Delete Task"
        })

        await syncProjectProgress(projectId);

        return{
            success: true,
            deleted: deleted,
            newActivity
        }
        
    } catch (err) {
        console.error("Failed to delete task", err);
        return {
            success: false,
            error: "Failed to delete task"
        }
        
    }
}