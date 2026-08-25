import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import db from "@/database";
import { workspaces } from "@/database/schema/schema";
import { eq } from "drizzle-orm";

export async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function requireWorkspaceAccess(workspaceId: string) {
  const session = await requireSession();

  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.id, workspaceId),
  });

  if (!workspace || workspace.ownerId !== session.user.id) {
    throw new Error("Forbidden");
  }

  return {
    session,
    workspace,
  };
}