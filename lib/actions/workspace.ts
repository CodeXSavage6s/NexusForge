// workspace.ts
"use server";

import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import db from "@/database/index";
import { workspaces } from "@/database/schema/schema";
import { eq, and } from 'drizzle-orm';

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
  try {
   const Workspaces = await db.select().from(workspaces).where(eq(workspaces.ownerId, userId));
    return Workspaces;
  } catch (err) {
    console.error("failed to fetch Workspaces", err);
    throw err;
  }
}

export async function getWorkspace(
  workspaceSlug: string, userId: string
): Promise<WorkspaceSummary | null> {
  try {
    
    const [ workspace ] = await db.select().from(workspaces).where(and(eq(workspaces.slug, workspaceSlug), eq(workspaces.ownerId, userId)));
    
    console.log("Workspace", workspace)
    return workspace;
  } catch (err) {
    console.error("no workspace found", err);
    return null;
  }
}

export async function createWorkspace(
  name: string,
  slug: string
): Promise<{ id?: string; name?: string; slug?: string; message?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Not authenticated");
  
  try {
    const check = await db.select().from(workspaces).where(eq(workspaces.slug, slug));
    
    console.log("Countr", check, check.length)
    if (check.length > 0) return { message: "Workspace name already taken" };
    
    const [workspace] = await db.insert(workspaces).values({
      name,
      slug,
      ownerId: session.user.id,
    }).returning();
  
    return { id: workspace.id, name: workspace.name, slug: workspace.slug };
  } catch (err) {
    console.error(err);
    return { message: "Failed to create Workspace" };
  }
}
