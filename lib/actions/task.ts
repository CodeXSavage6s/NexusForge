"use server"

import db from "@/database";
import { tasks, projects } from "@/database/schema/schema";
import { Task, TaskStatus, Priority } from "@/types/schema";
import { and, eq, count, sql, inArray } from "drizzle-orm"
import { NewProjectActivity } from "./activity";
import { syncProjectProgress } from "./project";
import { requireWorkspaceAccess } from "@/lib/authz";

type TASK = {
    success: boolean,
    tasks?: Task[]
    error?: string
    message?: unknown
}

/**
 * Confirms the project belongs to this workspace before any read/write
 * touches its tasks. Tasks only carry a projectId, so this is the only
 * thing standing between "my workspace" and "any workspace's tasks" —
 * never skip it.
 */
async function assertProjectInWorkspace(workspaceId: string, projectId: string) {
    const [project] = await db
        .select({ id: projects.id })
        .from(projects)
        .where(and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId)));

    if (!project) {
        throw new Error("Project not found in this workspace.");
    }
}

/** Confirms the task belongs to a project in this workspace. Returns the task's projectId. */
async function assertTaskInWorkspace(workspaceId: string, taskId: string): Promise<string> {
    const [row] = await db
        .select({ projectId: tasks.projectId })
        .from(tasks)
        .innerJoin(projects, eq(tasks.projectId, projects.id))
        .where(and(eq(tasks.id, taskId), eq(projects.workspaceId, workspaceId)));

    if (!row) {
        throw new Error("Task not found in this workspace.");
    }

    return row.projectId;
}

export async function GetTask(workspaceId: string, projectId: string): Promise<TASK> {
    try {
        await requireWorkspaceAccess(workspaceId);
        await assertProjectInWorkspace(workspaceId, projectId);

        const Tasks = await db.select().from(tasks).where(eq(tasks.projectId, projectId))

        return {
            success: true,
            tasks: Tasks
        }
    } catch (err) {
        console.error("Failed to get task", err)
        return {
            success: false,
            error: "Failed to get task",
            message: err instanceof Error ? err.message : String(err)
        }
    }
}

/** Due-soon (next 7 days) + overdue task counts/lists for a workspace, used by the dashboard. */
export async function GetWorkspaceTaskOverview(workspaceId: string) {
    try {
        await requireWorkspaceAccess(workspaceId);

        const now = new Date();
        const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const rows = await db
            .select({
                id: tasks.id,
                title: tasks.title,
                status: tasks.status,
                priority: tasks.priority,
                dueDate: tasks.dueDate,
                projectId: tasks.projectId,
                projectName: projects.name,
                projectSlug: projects.slug,
                clientId: projects.clientId,
            })
            .from(tasks)
            .innerJoin(projects, eq(tasks.projectId, projects.id))
            .where(and(eq(projects.workspaceId, workspaceId), sql`${tasks.status} != 'DONE'`));

        const overdue = rows
            .filter((t) => t.dueDate && t.dueDate.getTime() < now.getTime())
            .sort((a, b) => (a.dueDate!.getTime() - b.dueDate!.getTime()));

        const dueSoon = rows
            .filter((t) => t.dueDate && t.dueDate.getTime() >= now.getTime() && t.dueDate.getTime() <= soon.getTime())
            .sort((a, b) => (a.dueDate!.getTime() - b.dueDate!.getTime()));

        return {
            success: true,
            dueSoonCount: dueSoon.length,
            overdueCount: overdue.length,
            dueSoon: dueSoon.slice(0, 5),
            overdue: overdue.slice(0, 5),
        };
    } catch (err) {
        console.error("Failed to get workspace task overview", err);
        return { success: false, dueSoonCount: 0, overdueCount: 0, dueSoon: [], overdue: [] };
    }
}

export async function CreateTask({ workspaceId, projectId, title, description, priority, dueDate }: {
    workspaceId: string; projectId: string; title: string; description?: string; priority?: Priority; dueDate?: Date | null;
}) {
    try {
        await requireWorkspaceAccess(workspaceId);
        await assertProjectInWorkspace(workspaceId, projectId);

        if (!title?.trim()) {
            return { success: false, error: "Task title is required" };
        }

        const [newTask] = await db.insert(tasks).values({
            projectId,
            title: title.trim(),
            description: description ?? "",
            status: "TODO",
            priority: priority ?? "MEDIUM",
            dueDate: dueDate ?? null,
            position: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        await syncProjectProgress(projectId);

        return {
            success: true,
            task: newTask
        };
    } catch (err) {
        console.error("Create task failed:", err);
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to create task"
        };
    }
}

export async function ToggleTask({ workspaceId, taskId, clientId, projectId, userId }: {
    workspaceId: string; taskId: string; clientId: string; projectId: string; userId: string | undefined
}) {
    try {
        await requireWorkspaceAccess(workspaceId);
        await assertTaskInWorkspace(workspaceId, taskId);

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
            message: nextStatus === "DONE"
                ? `Completed task "${updated?.title ?? "task"}"`
                : `Reopened task "${updated?.title ?? "task"}"`,
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
            error: err instanceof Error ? err.message : "Failed to toggle task"
        };
    }
}

export async function UpdateTask({ workspaceId, taskId, clientId, projectId, userId, title, description, status, priority, dueDate }: {
    workspaceId: string;
    taskId: string;
    clientId: string;
    projectId: string;
    userId: string | undefined;
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: Priority;
    dueDate?: Date | null;
}) {
    try {
        await requireWorkspaceAccess(workspaceId);
        await assertTaskInWorkspace(workspaceId, taskId);

        const updates: Partial<typeof tasks.$inferInsert> = { updatedAt: new Date() };
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (status !== undefined) updates.status = status;
        if (priority !== undefined) updates.priority = priority;
        if (dueDate !== undefined) updates.dueDate = dueDate;

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
                ? `Updated task "${updated.title}" to ${status.replace("_", " ")}`
                : `Updated task "${updated.title}"`,
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
            error: err instanceof Error ? err.message : "Failed to update task"
        };
    }
}

export async function DeleteTask({ workspaceId, taskId, clientId, projectId, userId }: {
    workspaceId: string; taskId: string; clientId: string; projectId: string; userId: string | undefined
}) {
    try {
        await requireWorkspaceAccess(workspaceId);
        await assertTaskInWorkspace(workspaceId, taskId);

        const [deleted] = await db.delete(tasks).where(eq(tasks.id, taskId)).returning()

        const newActivity = await NewProjectActivity({
            message: `Deleted task "${deleted?.title ?? "task"}"`,
            clientId,
            projectId,
            userId,
            type: "Delete Task"
        })

        await syncProjectProgress(projectId);

        return {
            success: true,
            deleted: deleted,
            newActivity
        }

    } catch (err) {
        console.error("Failed to delete task", err);
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to delete task"
        }
    }
}
