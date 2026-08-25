"use server";

import db from "@/database";
import {
  notifications,
  projects,
} from "@/database/schema/schema";
import { and, eq, gte, lte } from "drizzle-orm";
import { requireWorkspaceAccess } from "@/lib/authz";

export async function getNotifications(workspaceId: string) {
  const { session } = await requireWorkspaceAccess(workspaceId);

  return db.query.notifications.findMany({
    where: and(
      eq(notifications.workspaceId, workspaceId),
      eq(notifications.userId, session.user.id)
    ),
    orderBy: (notifications, { desc }) => [
      desc(notifications.createdAt),
    ],
  });
}

export async function markNotificationAsRead(
  workspaceId: string,
  notificationId: string
) {
  const { session } = await requireWorkspaceAccess(workspaceId);

  return db
    .update(notifications)
    .set({
      read: true,
    })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.workspaceId, workspaceId),
        eq(notifications.userId, session.user.id)
      )
    )
    .returning();
}

export async function markAllNotificationsAsRead(
  workspaceId: string
) {
  const { session } = await requireWorkspaceAccess(workspaceId);

  return db
    .update(notifications)
    .set({
      read: true,
    })
    .where(
      and(
        eq(notifications.workspaceId, workspaceId),
        eq(notifications.userId, session.user.id)
      )
    )
    .returning();
}

export async function getUnreadNotificationCount(
  workspaceId: string
) {
  const { session } = await requireWorkspaceAccess(workspaceId);

  const result = await db.query.notifications.findMany({
    where: and(
      eq(notifications.workspaceId, workspaceId),
      eq(notifications.userId, session.user.id),
      eq(notifications.read, false)
    ),
    columns: {
      id: true,
    },
  });

  return result.length;
}

export async function createDeadlineNotifications(
  workspaceId: string
) {
  const { session } = await requireWorkspaceAccess(workspaceId);

  const now = new Date();

  const fiveDaysFromNow = new Date(now);
  fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);

  const upcomingProjects = await db.query.projects.findMany({
    where: and(
      eq(projects.workspaceId, workspaceId),
      gte(projects.dueDate, now),
      lte(projects.dueDate, fiveDaysFromNow)
    ),
  });

  for (const project of upcomingProjects) {
    const existing = await db.query.notifications.findFirst({
      where: and(
        eq(notifications.workspaceId, workspaceId),
        eq(notifications.userId, session.user.id),
        eq(notifications.projectId, project.id)
      ),
    });

    if (existing) continue;

    await db.insert(notifications).values({
      workspaceId,
      userId: session.user.id,
      projectId: project.id,
      title: "Project deadline approaching",
      message: `${project.name} is due within 5 days.`,
      read: false,
    });
  }
}