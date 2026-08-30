"use server";

import { randomBytes } from "crypto";
import db from "@/database";
import {
  invoices,
  invoiceLineItems,
  clients,
  projects,
  workspaces,
} from "@/database/schema/schema";
import { and, desc, eq, isNotNull, count } from "drizzle-orm";
import { requireWorkspaceAccess } from "@/lib/authz";
import {
  calculateTotal,
  validateLineItem,
  validateTaxRate,
} from "@/lib/invoices/calculations";
import type { InvoiceStatus } from "@/lib/constants/invoice-constants";
import { INVOICE_STATUSES } from "@/lib/constants/invoice-constants";
import type {
  InvoiceActionResult,
  InvoiceListItem,
  InvoiceWithDetails,
  PublicInvoiceView,
} from "@/types/invoice";

// ─────────────────────────────────────────────────────────────
// Shared input types
// ─────────────────────────────────────────────────────────────

interface InvoiceLineItemInput {
  description: string;
  quantity: number;
  rate: number;
}

interface InvoiceInput {
  workspaceId: string;
  clientId: string;
  projectId?: string | null;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  taxRate?: number | null;
  notes?: string | null;
  lineItems: InvoiceLineItemInput[];
}

// ─────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────

/**
 * Confirms the client belongs to this workspace, and — if a projectId is
 * supplied — that the project belongs to BOTH that client and workspace.
 * Never trust clientId/projectId from the browser without this check.
 */
async function assertClientAndProjectOwnership(
  workspaceId: string,
  clientId: string,
  projectId?: string | null
) {
  const [client] = await db
    .select({ id: clients.id })
    .from(clients)
    .where(and(eq(clients.id, clientId), eq(clients.workspaceId, workspaceId)));

  if (!client) {
    throw new Error("Selected client was not found in this workspace.");
  }

  if (projectId) {
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.workspaceId, workspaceId),
          eq(projects.clientId, clientId)
        )
      );

    if (!project) {
      throw new Error("Selected project does not belong to this client.");
    }
  }
}

function validateInvoiceInput(input: InvoiceInput): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (!input.clientId) fieldErrors.clientId = "Client is required.";
  if (!input.invoiceNumber?.trim()) fieldErrors.invoiceNumber = "Invoice number is required.";
  if (!input.issueDate || Number.isNaN(input.issueDate.getTime())) {
    fieldErrors.issueDate = "A valid issue date is required.";
  }
  if (!input.dueDate || Number.isNaN(input.dueDate.getTime())) {
    fieldErrors.dueDate = "A valid due date is required.";
  }
  if (
    input.issueDate &&
    input.dueDate &&
    !Number.isNaN(input.issueDate.getTime()) &&
    !Number.isNaN(input.dueDate.getTime()) &&
    input.dueDate < input.issueDate
  ) {
    fieldErrors.dueDate = "Due date cannot be before the issue date.";
  }

  const taxRateError = validateTaxRate(input.taxRate ?? null);
  if (taxRateError) fieldErrors.taxRate = taxRateError;

  if (!input.lineItems || input.lineItems.length === 0) {
    fieldErrors.lineItems = "Add at least one line item.";
  } else {
    for (const item of input.lineItems) {
      const error = validateLineItem(item);
      if (error) {
        fieldErrors.lineItems = error;
        break;
      }
    }
  }

  return fieldErrors;
}

function generateSecureToken(): string {
  return randomBytes(24).toString("base64url");
}

/** "INV-0001", "INV-0002", ... scoped per workspace, based on the highest existing suffix. */
async function generateNextInvoiceNumber(workspaceId: string): Promise<string> {
  const rows = await db
    .select({ invoiceNumber: invoices.invoiceNumber })
    .from(invoices)
    .where(eq(invoices.workspaceId, workspaceId));

  let max = 0;
  for (const row of rows) {
    const match = row.invoiceNumber.match(/^INV-(\d+)$/);
    if (match) max = Math.max(max, parseInt(match[1], 10));
  }

  return `INV-${String(max + 1).padStart(4, "0")}`;
}

// ─────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────

export async function SuggestNextInvoiceNumber(workspaceId: string): Promise<string> {
  await requireWorkspaceAccess(workspaceId);
  return generateNextInvoiceNumber(workspaceId);
}

export async function CreateInvoice(input: InvoiceInput): Promise<InvoiceActionResult> {
  try {
    await requireWorkspaceAccess(input.workspaceId);

    const fieldErrors = validateInvoiceInput(input);
    if (Object.keys(fieldErrors).length > 0) {
      return { success: false, error: "Please fix the errors below.", fieldErrors };
    }

    await assertClientAndProjectOwnership(input.workspaceId, input.clientId, input.projectId);

    const [duplicateNumber] = await db
      .select({ id: invoices.id })
      .from(invoices)
      .where(
        and(
          eq(invoices.workspaceId, input.workspaceId),
          eq(invoices.invoiceNumber, input.invoiceNumber.trim())
        )
      );
    if (duplicateNumber) {
      return {
        success: false,
        error: "An invoice with this number already exists.",
        fieldErrors: { invoiceNumber: "Invoice number already in use." },
      };
    }

    const { total } = calculateTotal(input.lineItems, input.taxRate ?? null);

    const invoice = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(invoices)
        .values({
          workspaceId: input.workspaceId,
          clientId: input.clientId,
          projectId: input.projectId || null,
          invoiceNumber: input.invoiceNumber.trim(),
          amount: total,
          status: "DRAFT",
          issueDate: input.issueDate,
          dueDate: input.dueDate,
          taxRate: input.taxRate ?? null,
          notes: input.notes?.trim() || null,
        })
        .returning();

      if (input.lineItems.length > 0) {
        await tx.insert(invoiceLineItems).values(
          input.lineItems.map((item) => ({
            invoiceId: created.id,
            description: item.description.trim(),
            quantity: item.quantity,
            rate: item.rate,
          }))
        );
      }

      return created;
    });

    return { success: true, invoiceId: invoice.id, invoice };
  } catch (err) {
    console.error("Failed to create invoice:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create invoice.",
    };
  }
}

export async function UpdateInvoice(
  invoiceId: string,
  input: InvoiceInput
): Promise<InvoiceActionResult> {
  try {
    await requireWorkspaceAccess(input.workspaceId);

    const fieldErrors = validateInvoiceInput(input);
    if (Object.keys(fieldErrors).length > 0) {
      return { success: false, error: "Please fix the errors below.", fieldErrors };
    }

    const [existing] = await db
      .select({ id: invoices.id })
      .from(invoices)
      .where(and(eq(invoices.id, invoiceId), eq(invoices.workspaceId, input.workspaceId)));
    if (!existing) {
      return { success: false, error: "Invoice not found." };
    }

    await assertClientAndProjectOwnership(input.workspaceId, input.clientId, input.projectId);

    const [duplicateNumber] = await db
      .select({ id: invoices.id })
      .from(invoices)
      .where(
        and(
          eq(invoices.workspaceId, input.workspaceId),
          eq(invoices.invoiceNumber, input.invoiceNumber.trim())
        )
      );
    if (duplicateNumber && duplicateNumber.id !== invoiceId) {
      return {
        success: false,
        error: "An invoice with this number already exists.",
        fieldErrors: { invoiceNumber: "Invoice number already in use." },
      };
    }

    const { total } = calculateTotal(input.lineItems, input.taxRate ?? null);

    const invoice = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(invoices)
        .set({
          clientId: input.clientId,
          projectId: input.projectId || null,
          invoiceNumber: input.invoiceNumber.trim(),
          amount: total,
          issueDate: input.issueDate,
          dueDate: input.dueDate,
          taxRate: input.taxRate ?? null,
          notes: input.notes?.trim() || null,
          updatedAt: new Date(),
        })
        .where(and(eq(invoices.id, invoiceId), eq(invoices.workspaceId, input.workspaceId)))
        .returning();

      // Simplest correct approach for MVP: replace all line items rather than
      // diffing individual rows.
      await tx.delete(invoiceLineItems).where(eq(invoiceLineItems.invoiceId, invoiceId));

      if (input.lineItems.length > 0) {
        await tx.insert(invoiceLineItems).values(
          input.lineItems.map((item) => ({
            invoiceId,
            description: item.description.trim(),
            quantity: item.quantity,
            rate: item.rate,
          }))
        );
      }

      return updated;
    });

    return { success: true, invoiceId, invoice };
  } catch (err) {
    console.error("Failed to update invoice:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update invoice.",
    };
  }
}

export async function UpdateInvoiceStatus(
  workspaceId: string,
  invoiceId: string,
  status: InvoiceStatus
): Promise<InvoiceActionResult> {
  try {
    await requireWorkspaceAccess(workspaceId);

    if (!INVOICE_STATUSES.includes(status)) {
      return { success: false, error: "Invalid status." };
    }

    const [updated] = await db
      .update(invoices)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(invoices.id, invoiceId), eq(invoices.workspaceId, workspaceId)))
      .returning();

    if (!updated) {
      return { success: false, error: "Invoice not found." };
    }

    return { success: true, invoiceId, invoice: updated };
  } catch (err) {
    console.error("Failed to update invoice status:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update invoice status.",
    };
  }
}

export async function DeleteInvoice(
  workspaceId: string,
  invoiceId: string
): Promise<InvoiceActionResult> {
  try {
    await requireWorkspaceAccess(workspaceId);

    const [deleted] = await db
      .delete(invoices)
      .where(and(eq(invoices.id, invoiceId), eq(invoices.workspaceId, workspaceId)))
      .returning();

    if (!deleted) {
      return { success: false, error: "Invoice not found or not authorized." };
    }

    return { success: true, invoiceId };
  } catch (err) {
    console.error("Failed to delete invoice:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete invoice.",
    };
  }
}

/** Returns the invoice's existing public link token, generating one on first use. */
export async function GeneratePublicInvoiceToken(
  workspaceId: string,
  invoiceId: string
): Promise<InvoiceActionResult & { publicToken?: string }> {
  try {
    await requireWorkspaceAccess(workspaceId);

    const [invoice] = await db
      .select({ id: invoices.id, publicToken: invoices.publicToken })
      .from(invoices)
      .where(and(eq(invoices.id, invoiceId), eq(invoices.workspaceId, workspaceId)));

    if (!invoice) {
      return { success: false, error: "Invoice not found." };
    }

    if (invoice.publicToken) {
      return { success: true, invoiceId, publicToken: invoice.publicToken };
    }

    // Extremely unlikely to collide, but check anyway before committing.
    let token = generateSecureToken();
    for (let attempt = 0; attempt < 3; attempt++) {
      const [clash] = await db
        .select({ id: invoices.id })
        .from(invoices)
        .where(eq(invoices.publicToken, token));
      if (!clash) break;
      token = generateSecureToken();
    }

    const [updated] = await db
      .update(invoices)
      .set({ publicToken: token })
      .where(and(eq(invoices.id, invoiceId), eq(invoices.workspaceId, workspaceId)))
      .returning({ publicToken: invoices.publicToken });

    return { success: true, invoiceId, publicToken: updated.publicToken ?? token };
  } catch (err) {
    console.error("Failed to generate public invoice link:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to generate link.",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// Reads
// ─────────────────────────────────────────────────────────────

export async function GetWorkspaceInvoices(
  workspaceId: string
): Promise<{ success: boolean; invoices: InvoiceListItem[]; error?: string }> {
  try {
    await requireWorkspaceAccess(workspaceId);

    const rows = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        amount: invoices.amount,
        currency: invoices.currency,
        status: invoices.status,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        clientId: clients.id,
        clientName: clients.name,
        projectId: projects.id,
        projectName: projects.name,
      })
      .from(invoices)
      .innerJoin(clients, eq(invoices.clientId, clients.id))
      .leftJoin(projects, eq(invoices.projectId, projects.id))
      .where(eq(invoices.workspaceId, workspaceId))
      .orderBy(desc(invoices.issueDate));

    const list: InvoiceListItem[] = rows.map((row) => ({
      id: row.id,
      invoiceNumber: row.invoiceNumber,
      amount: row.amount,
      currency: row.currency,
      status: row.status as InvoiceStatus,
      issueDate: row.issueDate,
      dueDate: row.dueDate,
      client: { id: row.clientId, name: row.clientName },
      project: row.projectId ? { id: row.projectId, name: row.projectName! } : null,
    }));

    return { success: true, invoices: list };
  } catch (err) {
    console.error("Failed to fetch workspace invoices:", err);
    return { success: false, invoices: [], error: "Failed to fetch invoices." };
  }
}

export async function GetInvoiceDetails(
  workspaceId: string,
  invoiceId: string
): Promise<InvoiceWithDetails | null> {
  try {
    await requireWorkspaceAccess(workspaceId);

    const [row] = await db
      .select({
        invoice: invoices,
        client: {
          id: clients.id,
          name: clients.name,
          companyName: clients.companyName,
          email: clients.email,
          address: clients.address,
        },
        project: { id: projects.id, name: projects.name },
      })
      .from(invoices)
      .innerJoin(clients, eq(invoices.clientId, clients.id))
      .leftJoin(projects, eq(invoices.projectId, projects.id))
      .where(and(eq(invoices.id, invoiceId), eq(invoices.workspaceId, workspaceId)));

    if (!row) return null;

    const lineItems = await db
      .select()
      .from(invoiceLineItems)
      .where(eq(invoiceLineItems.invoiceId, invoiceId))
      .orderBy(invoiceLineItems.createdAt);

    return {
      ...row.invoice,
      status: row.invoice.status as InvoiceStatus,
      client: row.client,
      project: row.project?.id ? row.project : null,
      lineItems,
    };
  } catch (err) {
    console.error("Failed to fetch invoice details:", err);
    return null;
  }
}

/**
 * Public, UNAUTHENTICATED lookup by token. Deliberately returns only the
 * fields a client should see — no ids, no workspaceId, no internal notes
 * beyond what the freelancer wrote for the client, nothing about other
 * invoices.
 */
export async function GetPublicInvoice(publicToken: string): Promise<PublicInvoiceView | null> {
  try {
    if (!publicToken) return null;

    const [row] = await db
      .select({
        invoiceNumber: invoices.invoiceNumber,
        status: invoices.status,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        currency: invoices.currency,
        taxRate: invoices.taxRate,
        notes: invoices.notes,
        businessName: workspaces.name,
        businessLogo: workspaces.logo,
        clientName: clients.name,
        clientEmail: clients.email,
        clientAddress: clients.address,
        invoiceId: invoices.id,
      })
      .from(invoices)
      .innerJoin(clients, eq(invoices.clientId, clients.id))
      .innerJoin(workspaces, eq(invoices.workspaceId, workspaces.id))
      .where(and(eq(invoices.publicToken, publicToken), isNotNull(invoices.publicToken)));

    if (!row) return null;

    const lineItemRows = await db
      .select({
        id: invoiceLineItems.id,
        description: invoiceLineItems.description,
        quantity: invoiceLineItems.quantity,
        rate: invoiceLineItems.rate,
      })
      .from(invoiceLineItems)
      .where(eq(invoiceLineItems.invoiceId, row.invoiceId))
      .orderBy(invoiceLineItems.createdAt);

    const { subtotal, tax, total } = calculateTotal(lineItemRows, row.taxRate);

    return {
      invoiceNumber: row.invoiceNumber,
      status: row.status as InvoiceStatus,
      issueDate: row.issueDate,
      dueDate: row.dueDate,
      currency: row.currency,
      subtotal,
      tax,
      total,
      taxRate: row.taxRate,
      notes: row.notes,
      lineItems: lineItemRows,
      business: { name: row.businessName, logo: row.businessLogo },
      client: { name: row.clientName, email: row.clientEmail, address: row.clientAddress },
    };
  } catch (err) {
    console.error("Failed to fetch public invoice:", err);
    return null;
  }
}

export async function InvoiceCount(workspaceId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(invoices)
    .where(eq(invoices.workspaceId, workspaceId));
  return result[0]?.count ?? 0;
}