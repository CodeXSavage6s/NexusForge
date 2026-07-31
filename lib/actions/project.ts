"use server"

import { projects } from '@/database/schema/schema'
import db from '@/database/index'
import { eq, count, and, ne } from 'drizzle-orm'
import { PROJECT_PRIORITY, PROJECT_STATUS } from "@/lib/constants/client-constants"
import { success } from 'better-auth';

export async function ProjectsCount(workspaceId: string): Promise<number> {
  const result = await db.select({ count: count() }).from(projects).where(eq(projects.workspaceId, workspaceId));
  return result[0]?.count ?? 0;
}

export async function CreateProject(data: {
    id: string;
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
    completedAt?: Date;
    progress?: string;
    color?: string;
    icon?: string;
}) {
  try {
    const { id, workspaceId, clientId, name, slug, description, status, priority, budget, currency, startDate, dueDate, completedAt, progress, color, icon } = data;

    const check = await db.select().from(projects).where(and(eq(projects.clientId, clientId), eq(projects.name, name), ne(projects.id, id)))
   
    if (check.length > 0) {
      throw new Error('Project with the same name already exists for this client in the workspace.');
    }
  
    const newProject = await db.insert(projects).values([{
      workspaceId,
      clientId,
      name,
      slug,
      description,
      status,
      priority,
      budget,
      currency,
      startDate,
      dueDate,
      completedAt,
      progress,
      color,
      icon
    } as any]);

    return {
      success: true,
      project: newProject
    };
    console.log('newproject', newProject)

  } catch (err) {
    return {
      success: false,
      error: err,
      message: 'Failed to create project'
    }
    console.log("errror", err)
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