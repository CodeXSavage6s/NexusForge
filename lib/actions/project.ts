"use server"

import { projects, tasks } from '@/database/schema/schema'
import db from '@/database/index'
import { eq, count, and, ne } from 'drizzle-orm'
import { PROJECT_PRIORITY, PROJECT_STATUS } from "@/lib/constants/client-constants"
import { NewClientActivity } from "@/lib/actions/activity"
import { auth } from "@/lib/better-auth/auth"
import { headers } from "next/headers"
import { success } from 'better-auth';



export async function ProjectsCount(workspaceId: string): Promise<number> {
  const result = await db.select({ count: count() }).from(projects).where(eq(projects.workspaceId, workspaceId));
  return result[0]?.count ?? 0;
}

export async function ProjectsClientCount(clientId: string): Promise<number> {
  const result = await db.select({ count: count() }).from(projects).where(eq(projects.clientId, clientId));
  return result[0]?.count ?? 0;
}

export async function getTaskCompletionProgress(totalTasks: number, completedTasks: number) {
  if (totalTasks <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((completedTasks / totalTasks) * 100)));
}

export async function calculateProjectTaskProgress(projectId: string) {
  const totalResult = await db.select({ count: count() }).from(tasks).where(eq(tasks.projectId, projectId));
  const completedResult = await db
    .select({ count: count() })
    .from(tasks)
    .where(and(eq(tasks.projectId, projectId), eq(tasks.status, "DONE")));

  const total = Number(totalResult[0]?.count ?? 0);
  const completed = Number(completedResult[0]?.count ?? 0);

  return {
    total,
    completed,
    progress: await getTaskCompletionProgress(total, completed),
  };
}

export async function syncProjectProgress(projectId: string) {
  const { progress } = await calculateProjectTaskProgress(projectId);
  const [updatedProject] = await db
    .update(projects)
    .set({ progress })
    .where(eq(projects.id, projectId))
    .returning();

  return {
    success: Boolean(updatedProject),
    project: updatedProject,
    progress,
  };
}

export async function GetProjectsForClient(clientId: string) {
  try {
    const result = await db.select().from(projects).where(eq(projects.clientId, clientId));
    return {
      success: true,
      projects: result,
    };
  } catch (err) {
    console.error('Failed to fetch projects for client', err);
    return {
      success: false,
      message: 'Failed to fetch projects for client',
      err,
    };
  }
}

export async function CreateProject(data: {
    workspaceId: string;
    clientId: string;
    name: string;
    slug?: string;
    description?: string;
    status: PROJECT_STATUS;
    priority?: PROJECT_PRIORITY;
    budget?: number;
    currency?: string;
    startDate?: Date;
    dueDate?: Date;
    color?: string;
    icon?: string;
}) {
  try {
    // console.log("create project hit")
    // console.log("data", data)
    const { workspaceId, clientId, name, slug, description, status, priority, budget, currency, startDate, dueDate, color, icon } = data;

    const check = await db.select().from(projects).where(and(eq(projects.clientId, clientId), eq(projects.name, name)));

    console.log("check", check)
    if (check.length > 0) {
      return {
        success: false,
        error: 'duplicate',
        message: 'Project with the same name already exists for this client in the workspace.',
      };
    }

    const [insertedProject] = await db
      .insert(projects)
      .values({
          clientId,
          workspaceId,
          name,
          slug,
          description,
          status,
          priority,
          budget,
          currency,
          startDate,
          dueDate,
      })
      .returning();

    const session = await auth.api.getSession({ headers: await headers() });

    const user = session?.user

    const newActivity = await NewClientActivity({ clientId, userId: user?.id, type: "Create Project", projectId: insertedProject.id, message: "Created new Project"})

      // console.log("Project created successfully:", insertedProject);
    return {
      success: true,
      project: insertedProject,
    };

  } catch (err) {
    console.error("Failed to create project:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
      message: err instanceof Error ? err.message : 'Failed to create project',
    };
  }

}

export async function GetProjectDetails(projectiD: string, clientId: string) {
  try {
    const project = await db.select().from(projects).where(and(eq(projects.id, projectiD), eq(projects.clientId, clientId)))

    return {
      success: true,
      project
    }
  } catch (err) {
    console.error("Failed to fecth project details", err)
    return {
      success: false,
      message: "Failed to fetch Project Details",
      err
    }
  }
}

export async function UpdateProject(data: {
    id: string;
    workspaceId: string;
    clientId: string;
    name: string;
    slug?: string;
    description?: string;
    status: PROJECT_STATUS;
    priority: PROJECT_PRIORITY;
    budget?: string;
    currency?: string;
    startDate?: Date;
    dueDate?: Date;
    completedAt?: Date;
    progress?: number;
    color?: string;
    icon?: string;
}) {
  const { id, workspaceId, clientId, name, slug, description, status, priority, budget, currency, startDate, dueDate, completedAt, progress, color, icon } = data; 
  try {
    if (!id) return { success: false, error: "Could not find projectId"}
    if (!workspaceId) return { success: false, error: "Could not find workspaceId"}
    if (!clientId) return { success: false, error: "Could not identify Client"}

    const check = db.select().from(projects).where(and(eq(projects.clientId, clientId), eq(projects.name, name), ne(projects.id, id)))

    if (!check) return { success: false, error: "A project with this name alread exist in client"}

    const [updatedProject] = await db.update(projects).set({ id, workspaceId, clientId, name, slug, description, status, priority, budget, currency, startDate, dueDate, completedAt, progress, color, icon }).returning()

    return {
      success: true,
      updatedProject,
      message: "Updated Project successful"
    }
  } catch (err) {
    console.log("Error Upating Project", err)
    return {
      success: false,
      error: "Failed to Update Project"
    }
  }
}

export async function DeleteProject(projectId: string, clientId?: string) {
  try {
    const whereClause = clientId ? and(eq(projects.id, projectId), eq(projects.clientId, clientId)) : eq(projects.id, projectId);
    const [deleted] = await db.delete(projects).where(whereClause).returning();
    if (!deleted) return { success: false, error: 'Project not found or not authorized' };
    return { success: true, project: deleted };
  } catch (err) {
    console.error('Failed to delete project', err);
    return { success: false, error: 'Failed to delete project' };
  }
}