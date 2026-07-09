import { projects } from '@/database/schema/schema'
import db from '@/database/index'
import { eq, count } from 'drizzle-orm'

export async function ProjectsCount(workspaceId: string): Promise<number> {
  const result = await db.select({ count: count() }).from(projects).where(eq(projects.workspaceId, workspaceId));
  return result[0]?.count ?? 0;
}