import { notifications } from '@/database/schema/schema'
import db from '@/database/index'
import { eq } from 'drizzle-orm'

export async function UnreadNoticationsCount(userId) {
    try {
      const count = await db.$count(notifications, eq(notifications.recipientId, userId))
      return count
      console.log(count)
    } catch (err) {
      console.error('failed ', err)
    }
}

