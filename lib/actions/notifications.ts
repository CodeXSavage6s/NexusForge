import { notifications } from '@/database/schema/schema'
import db from '@/database/index'
import { eq } from 'drizzle-orm'

export async function UnreadNotificationsCount(userId) {
    try {
      const count = await db.$count(notifications, eq(notifications.workspaceId, userId))
      console.log(count)
      return count
    } catch (err) {
      console.error('failed ', err)
    }
}

