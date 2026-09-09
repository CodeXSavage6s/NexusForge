"use server";

import db from "@/database/index";
import { documents, projects } from "@/database/schema/schema";
import { and, desc, eq } from "drizzle-orm";
import { requireWorkspaceAccess } from "@/lib/authz";

/** Confirms the project belongs to this workspace before touching its documents. */
async function assertProjectInWorkspace(workspaceId: string, projectId: string) {
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId)));

  if (!project) {
    throw new Error("Project not found in this workspace.");
  }
}

export interface DocumentActionResult {
  success: boolean;
  error?: string;
  document?: typeof documents.$inferSelect;
}

export async function GetProjectDocuments(
  workspaceId: string,
  projectId: string
): Promise<{ success: boolean; documents: (typeof documents.$inferSelect)[]; error?: string }> {
  try {
    await requireWorkspaceAccess(workspaceId);
    await assertProjectInWorkspace(workspaceId, projectId);

    const rows = await db
      .select()
      .from(documents)
      .where(and(eq(documents.projectId, projectId), eq(documents.isArchived, false)))
      .orderBy(desc(documents.updatedAt));

    return { success: true, documents: rows };
  } catch (err) {
    console.error("Failed to fetch project documents:", err);
    return { success: false, documents: [], error: "Failed to fetch documents." };
  }
}

export async function CreateDocument(
  workspaceId: string,
  projectId: string,
  userId: string,
  input: { title: string; content?: string }
): Promise<DocumentActionResult> {
  try {
    await requireWorkspaceAccess(workspaceId);
    await assertProjectInWorkspace(workspaceId, projectId);

    const title = input.title.trim();
    if (!title) return { success: false, error: "Title is required." };

    const [created] = await db
      .insert(documents)
      .values({
        projectId,
        title,
        content: input.content?.trim() ?? "",
        createdBy: userId,
        lastEditedBy: userId,
      })
      .returning();

    return { success: true, document: created };
  } catch (err) {
    console.error("Failed to create document:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create document.",
    };
  }
}

export async function UpdateDocument(
  workspaceId: string,
  documentId: string,
  userId: string,
  input: { title: string; content?: string }
): Promise<DocumentActionResult> {
  try {
    await requireWorkspaceAccess(workspaceId);

    // Verify the document's project belongs to this workspace via a join,
    // rather than trusting documentId alone.
    const [existing] = await db
      .select({ id: documents.id })
      .from(documents)
      .innerJoin(projects, eq(documents.projectId, projects.id))
      .where(and(eq(documents.id, documentId), eq(projects.workspaceId, workspaceId)));

    if (!existing) {
      return { success: false, error: "Document not found in this workspace." };
    }

    const title = input.title.trim();
    if (!title) return { success: false, error: "Title is required." };

    const [updated] = await db
      .update(documents)
      .set({
        title,
        content: input.content ?? "",
        lastEditedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId))
      .returning();

    return { success: true, document: updated };
  } catch (err) {
    console.error("Failed to update document:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update document.",
    };
  }
}

export async function DeleteDocument(
  workspaceId: string,
  documentId: string
): Promise<DocumentActionResult> {
  try {
    await requireWorkspaceAccess(workspaceId);

    const [existing] = await db
      .select({ id: documents.id })
      .from(documents)
      .innerJoin(projects, eq(documents.projectId, projects.id))
      .where(and(eq(documents.id, documentId), eq(projects.workspaceId, workspaceId)));

    if (!existing) {
      return { success: false, error: "Document not found in this workspace." };
    }

    await db.delete(documents).where(eq(documents.id, documentId));

    return { success: true };
  } catch (err) {
    console.error("Failed to delete document:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete document.",
    };
  }
}
