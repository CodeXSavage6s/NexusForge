import { notifications } from '@/database/schema/schema'
import db from '@/database/index'
import { eq, and, count } from 'drizzle-orm'

export async function UnreadNotificationsCount(userId: string): Promise<number> {
    try {
      const result = await db.select({ count: count() })
        .from(notifications)
        .where(and(
          eq(notifications.recipientId, userId),
          eq(notifications.isRead, false)
        ));
      return result[0]?.count ?? 0;
    } catch (err) {
      console.error('failed ', err)
      return 0;
    }
}

