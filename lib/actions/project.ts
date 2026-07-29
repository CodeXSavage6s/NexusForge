import { projects } from '@/database/schema/schema'
import db from '@/database/index'
import { eq, count, and, ne } from 'drizzle-orm'
import { success } from 'better-auth';

export async function ProjectsCount(workspaceId: string): Promise<number> {
  const result = await db.select({ count: count() }).from(projects).where(eq(projects.workspaceId, workspaceId));
  return result[0]?.count ?? 0;
}

export async function CreateProject(data: {
    id: string;
    workspaceId: string;
    clientId: string;
    name?: string;
    slug: string;
    description: string;
    status: string;
    priority: string;
    budget: number;
    currency: string;
    startDate: Date;
    dueDate: Date;
    completedAt: Date;
    progress: string;
    color: string;
    icon: string;
}) {
  try {
    const { id, workspaceId, clientId, name, slug, description, status, priority, budget, currency, startDate, dueDate, completedAt, progress, color, icon } = data;
    const check = await db.select().from(projects).where(and(eq(projects.workspaceId, workspaceId), eq(projects.clientId, clientId), eq(projects.name, name)))
   
    if (check.length > 0) {
      throw new Error('Project with the same name already exists for this client in the workspace.');
    }
  
    const newProject = await db.insert(projects).values({
      id,
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
    });

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