// workspace.ts
"use server";

import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import db from "@/database/index";
import { workspaces } from "@/database/schema/schema";
import { eq, and } from 'drizzle-orm';
import { INVOICE_CURRENCIES } from "@/lib/constants/invoice-constants";

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  clientCount: number;
  projectCount: number;
  logo: string;
  businessEmail?: string | null;
  businessPhone?: string | null;
  businessAddress?: string | null;
  taxId?: string | null;
  defaultCurrency?: string;
  paymentInstructions?: string | null;
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
  workspaceSlug: string, userId: string | undefined
): Promise<WorkspaceSummary | null> {
  try {
    
    const [ workspace ] = await db.select().from(workspaces).where(and(eq(workspaces.slug, workspaceSlug), eq(workspaces.ownerId, userId)));
    
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

export async function DeleteWorkspace(workspaceId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false, error: 'Not authenticated' };

  try {
    const [deleted] = await db
      .delete(workspaces)
      .where(and(eq(workspaces.id, workspaceId), eq(workspaces.ownerId, session.user.id)))
      .returning();

    if (!deleted) return { success: false, error: 'Workspace not found or not authorized' };

    return { success: true, workspace: deleted };
  } catch (err) {
    console.error('Failed to delete workspace', err);
    return { success: false, error: 'Failed to delete workspace' };
  }
}

// ─────────────────────────────────────────────────────────────
// Business info — used on invoice previews / the public invoice page.
// ─────────────────────────────────────────────────────────────

export interface UpdateWorkspaceBusinessInfoInput {
  workspaceId: string;
  name: string;
  businessEmail?: string | null;
  businessPhone?: string | null;
  businessAddress?: string | null;
  taxId?: string | null;
  defaultCurrency?: string | null;
  paymentInstructions?: string | null;
}

export interface UpdateWorkspaceBusinessInfoResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  workspace?: typeof workspaces.$inferSelect;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function UpdateWorkspaceBusinessInfo(
  input: UpdateWorkspaceBusinessInfoInput
): Promise<UpdateWorkspaceBusinessInfoResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false, error: "Not authenticated" };

  try {
    // Ownership check — never trust workspaceId from the client without it.
    const [existing] = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(and(eq(workspaces.id, input.workspaceId), eq(workspaces.ownerId, session.user.id)));

    if (!existing) {
      return { success: false, error: "Workspace not found or not authorized." };
    }

    const fieldErrors: Record<string, string> = {};

    const name = input.name?.trim();
    if (!name) fieldErrors.name = "Business name is required.";

    if (input.businessEmail?.trim() && !EMAIL_RE.test(input.businessEmail.trim())) {
      fieldErrors.businessEmail = "Enter a valid email address.";
    }

    const currency = input.defaultCurrency?.trim() || "USD";
    if (!INVOICE_CURRENCIES.includes(currency as (typeof INVOICE_CURRENCIES)[number])) {
      fieldErrors.defaultCurrency = "Unsupported currency.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return { success: false, error: "Please fix the errors below.", fieldErrors };
    }

    const [updated] = await db
      .update(workspaces)
      .set({
        name,
        businessEmail: input.businessEmail?.trim() || null,
        businessPhone: input.businessPhone?.trim() || null,
        businessAddress: input.businessAddress?.trim() || null,
        taxId: input.taxId?.trim() || null,
        defaultCurrency: currency,
        paymentInstructions: input.paymentInstructions?.trim() || null,
        updatedAt: new Date(),
      })
      .where(and(eq(workspaces.id, input.workspaceId), eq(workspaces.ownerId, session.user.id)))
      .returning();

    if (!updated) {
      return { success: false, error: "Workspace not found or not authorized." };
    }

    return { success: true, workspace: updated };
  } catch (err) {
    console.error("Failed to update workspace business info:", err);
    return { success: false, error: "Failed to update workspace." };
  }
}
