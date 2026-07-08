import { projects } from '@/database/schema/schema'
import db from '@/database/index'
import { eq } from 'drizzle-orm'

export async function ProjectsCount(userId) {
  return await db.select().from(projects).where(eq(projects.workspaceId, userId));
}