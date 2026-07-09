"use server";

import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import db from "@/database/index";
import { workspaces } from "@/database/schema/schema";

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  clientCount: number;
  projectCount: number;
}


export async function getUserWorkspaces(
  userId: string
): Promise<WorkspaceSummary[]> {

  return [];
}


export async function getWorkspace(
  workspaceId: string
): Promise<WorkspaceSummary | null> {
  return null;
}

export async function createWorkspace(
  name: string,
  slug: string
): Promise<{ id: string; name: string; slug: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Not authenticated");

  const [workspace] = await db.insert(workspaces).values({
    name,
    slug,
    ownerId: session.user.id,
  }).returning();

  return { id: workspace.id, name: workspace.name, slug: workspace.slug };
}
