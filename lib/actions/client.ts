import { clients } from '@/database/schema/schema'
import db from '@/database/index'
import { eq } from 'drizzle-orm'

export async function ClientCount(userId) {
  return await db.select().from(clients).where(eq(clients.ownerId, userId))
}