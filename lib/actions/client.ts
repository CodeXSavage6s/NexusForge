import { clients } from '@/database/schema/schema'
import db from '@/database/index'
import { eq, count } from 'drizzle-orm'

export async function ClientCount(workspaceId: string): Promise<number> {
  const result = await db.select({ count: count() }).from(clients).where(eq(clients.workspaceId, workspaceId));
  return result[0]?.count ?? 0;
}