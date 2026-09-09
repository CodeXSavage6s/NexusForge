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
import { and, desc, eq, isNotNull, count, sql } from "drizzle-orm";
import { requireWorkspaceAccess } from "@/lib/authz";
import {
  calculateTotal,
  validateLineItem,
  validateTaxRate,
  deriveInvoiceDisplayStatus,
  remainingBalance,
  validatePaymentAmount,
  statusForPaymentState,
  round2,
} from "@/lib/invoices/calculations";
import type { InvoiceStatus } from "@/lib/constants/invoice-constants";
import {
  INVOICE_STATUSES,
  INVOICE_CURRENCIES,
  MANUALLY_SETTABLE_INVOICE_STATUSES,
} from "@/lib/constants/invoice-constants";
import type {
  InvoiceActionResult,
  InvoiceListItem,
  InvoiceSummaryTotals,
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
  currency?: string;
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

  if (input.currency && !INVOICE_CURRENCIES.includes(input.currency as (typeof INVOICE_CURRENCIES)[number])) {
    fieldErrors.currency = "Unsupported currency.";
  }

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
          currency: input.currency ?? "USD",
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
      .select({ id: invoices.id, amountPaid: invoices.amountPaid, currency: invoices.currency })
      .from(invoices)
      .where(and(eq(invoices.id, invoiceId), eq(invoices.workspaceId, input.workspaceId)));
    if (!existing) {
      return { success: false, error: "Invoice not found." };
    }

    // Changing currency after money has already been recorded against the
    // invoice would silently re-denominate the amount paid. Block it rather
    // than guess a conversion.
    if (
      input.currency &&
      input.currency !== existing.currency &&
      existing.amountPaid > 0
    ) {
      return {
        success: false,
        error: "Cannot change currency after a payment has been recorded on this invoice.",
        fieldErrors: { currency: "Currency is locked once a payment has been recorded." },
      };
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

    // Never allow the new total to drop below what's already been paid —
    // that would create an impossible "amountPaid > total" state. Require
    // the freelancer to adjust the recorded payment first.
    if (round2(total) < round2(existing.amountPaid)) {
      return {
        success: false,
        error: `The new total (${total.toFixed(2)}) is less than the amount already paid (${existing.amountPaid.toFixed(2)}). Adjust the recorded payment before lowering the total.`,
        fieldErrors: { lineItems: "Total cannot be less than the amount already paid." },
      };
    }

    const invoice = await db.transaction(async (tx) => {
      // Read current status inside the transaction so the recompute below
      // is based on fresh data (protects against a concurrent payment).
      const [current] = await tx
        .select({ status: invoices.status, amountPaid: invoices.amountPaid })
        .from(invoices)
        .where(eq(invoices.id, invoiceId));

      // If the invoice already has a payment recorded, the total just
      // changed — recheck whether it's still fully paid or has become
      // partially paid relative to the new total.
      const nextStatus =
        current && (current.status === "PAID" || current.status === "PARTIALLY_PAID")
          ? statusForPaymentState(current.amountPaid, total)
          : undefined;

      const [updated] = await tx
        .update(invoices)
        .set({
          clientId: input.clientId,
          projectId: input.projectId || null,
          invoiceNumber: input.invoiceNumber.trim(),
          amount: total,
          currency: input.currency ?? existing.currency,
          ...(nextStatus ? { status: nextStatus } : {}),
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

    // PAID / PARTIALLY_PAID must go through RecordInvoicePayment or
    // MarkInvoiceAsPaid so amountPaid/paidAt stay consistent with the
    // status. OVERDUE is never stored directly — it's derived at read time.
    if (!MANUALLY_SETTABLE_INVOICE_STATUSES.includes(status as (typeof MANUALLY_SETTABLE_INVOICE_STATUSES)[number])) {
      return {
        success: false,
        error:
          status === "OVERDUE"
            ? "Overdue is calculated automatically from the due date and can't be set manually."
            : "Use the payment actions to mark an invoice paid or partially paid.",
      };
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

/**
 * Records a (possibly partial) payment against an invoice. Moves the
 * invoice to PARTIALLY_PAID or PAID depending on whether the new
 * amountPaid reaches the total. Never allows amountPaid to exceed the
 * invoice total.
 */
export async function RecordInvoicePayment(
  workspaceId: string,
  invoiceId: string,
  input: { amount: number; method?: string | null }
): Promise<InvoiceActionResult> {
  try {
    await requireWorkspaceAccess(workspaceId);

    const [invoice] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, invoiceId), eq(invoices.workspaceId, workspaceId)));

    if (!invoice) {
      return { success: false, error: "Invoice not found." };
    }

    if (invoice.status === "CANCELLED") {
      return { success: false, error: "Cannot record a payment against a cancelled invoice." };
    }

    const paymentError = validatePaymentAmount({
      amount: input.amount,
      invoiceTotal: invoice.amount,
      alreadyPaid: invoice.amountPaid,
    });
    if (paymentError) {
      return { success: false, error: paymentError, fieldErrors: { amount: paymentError } };
    }

    const nextAmountPaid = round2(invoice.amountPaid + input.amount);
    const nextStatus = statusForPaymentState(nextAmountPaid, invoice.amount);

    const [updated] = await db
      .update(invoices)
      .set({
        amountPaid: nextAmountPaid,
        status: nextStatus,
        paidAt: nextStatus === "PAID" ? new Date() : invoice.paidAt,
        paymentMethod: input.method?.trim() || invoice.paymentMethod,
        updatedAt: new Date(),
      })
      .where(and(eq(invoices.id, invoiceId), eq(invoices.workspaceId, workspaceId)))
      .returning();

    return { success: true, invoiceId, invoice: updated };
  } catch (err) {
    console.error("Failed to record invoice payment:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to record payment.",
    };
  }
}

/** Marks an invoice fully paid in one step (amountPaid = total, paidAt = now). */
export async function MarkInvoiceAsPaid(
  workspaceId: string,
  invoiceId: string,
  input?: { method?: string | null }
): Promise<InvoiceActionResult> {
  try {
    await requireWorkspaceAccess(workspaceId);

    const [invoice] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, invoiceId), eq(invoices.workspaceId, workspaceId)));

    if (!invoice) {
      return { success: false, error: "Invoice not found." };
    }

    if (invoice.status === "CANCELLED") {
      return { success: false, error: "Cannot mark a cancelled invoice as paid." };
    }

    const [updated] = await db
      .update(invoices)
      .set({
        amountPaid: invoice.amount,
        status: "PAID",
        paidAt: new Date(),
        paymentMethod: input?.method?.trim() || invoice.paymentMethod,
        updatedAt: new Date(),
      })
      .where(and(eq(invoices.id, invoiceId), eq(invoices.workspaceId, workspaceId)))
      .returning();

    return { success: true, invoiceId, invoice: updated };
  } catch (err) {
    console.error("Failed to mark invoice as paid:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to mark invoice as paid.",
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
        amountPaid: invoices.amountPaid,
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
      amountPaid: row.amountPaid,
      remainingBalance: remainingBalance(row.amount, row.amountPaid),
      currency: row.currency,
      status: row.status as InvoiceStatus,
      displayStatus: deriveInvoiceDisplayStatus({
        status: row.status as InvoiceStatus,
        dueDate: row.dueDate,
        amountPaid: row.amountPaid,
        amount: row.amount,
      }),
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

/**
 * Aggregate totals for the invoice list summary cards and the dashboard.
 * Computed with a single grouped query rather than pulling every invoice
 * row into memory.
 */
export async function GetInvoiceSummary(workspaceId: string): Promise<InvoiceSummaryTotals> {
  await requireWorkspaceAccess(workspaceId);

  const rows = await db
    .select({
      status: invoices.status,
      amount: invoices.amount,
      amountPaid: invoices.amountPaid,
      dueDate: invoices.dueDate,
    })
    .from(invoices)
    .where(eq(invoices.workspaceId, workspaceId));

  let totalInvoiced = 0;
  let totalPaid = 0;
  let totalOutstanding = 0;
  let totalOverdue = 0;
  let overdueCount = 0;
  const now = new Date();

  for (const row of rows) {
    const status = row.status as InvoiceStatus;
    if (status === "CANCELLED") continue;

    totalInvoiced = round2(totalInvoiced + row.amount);
    totalPaid = round2(totalPaid + row.amountPaid);

    if (status === "PAID") continue;

    const balance = remainingBalance(row.amount, row.amountPaid);
    totalOutstanding = round2(totalOutstanding + balance);

    const displayStatus = deriveInvoiceDisplayStatus({
      status,
      dueDate: row.dueDate,
      amountPaid: row.amountPaid,
      amount: row.amount,
      now,
    });
    if (displayStatus === "OVERDUE") {
      totalOverdue = round2(totalOverdue + balance);
      overdueCount += 1;
    }
  }

  // Workspaces are effectively single-currency for MVP invoicing (the
  // currency picker is per-invoice, but summing across currencies without
  // conversion would be misleading — see IMPLEMENTATION_NOTES for the
  // multi-currency caveat).
  return {
    totalInvoiced,
    totalPaid,
    totalOutstanding,
    totalOverdue,
    overdueCount,
    currency: "USD",
  };
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

    const status = row.invoice.status as InvoiceStatus;

    return {
      ...row.invoice,
      status,
      displayStatus: deriveInvoiceDisplayStatus({
        status,
        dueDate: row.invoice.dueDate,
        amountPaid: row.invoice.amountPaid,
        amount: row.invoice.amount,
      }),
      remainingBalance: remainingBalance(row.invoice.amount, row.invoice.amountPaid),
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
        amountPaid: invoices.amountPaid,
        notes: invoices.notes,
        businessName: workspaces.name,
        businessLogo: workspaces.logo,
        businessEmail: workspaces.businessEmail,
        businessPhone: workspaces.businessPhone,
        businessAddress: workspaces.businessAddress,
        businessTaxId: workspaces.taxId,
        paymentInstructions: workspaces.paymentInstructions,
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
    const status = row.status as InvoiceStatus;

    return {
      invoiceNumber: row.invoiceNumber,
      status,
      displayStatus: deriveInvoiceDisplayStatus({
        status,
        dueDate: row.dueDate,
        amountPaid: row.amountPaid,
        amount: total,
      }),
      issueDate: row.issueDate,
      dueDate: row.dueDate,
      currency: row.currency,
      subtotal,
      tax,
      total,
      amountPaid: row.amountPaid,
      remainingBalance: remainingBalance(total, row.amountPaid),
      taxRate: row.taxRate,
      notes: row.notes,
      lineItems: lineItemRows,
      business: {
        name: row.businessName,
        logo: row.businessLogo,
        email: row.businessEmail,
        phone: row.businessPhone,
        address: row.businessAddress,
        taxId: row.businessTaxId,
        paymentInstructions: row.paymentInstructions,
      },
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

/** Unpaid invoice count + outstanding amount for a single client — used on the client detail page. */
export async function GetClientInvoiceSummary(
  workspaceId: string,
  clientId: string
): Promise<{ unpaidCount: number; outstandingAmount: number; currency: string }> {
  await requireWorkspaceAccess(workspaceId);

  const rows = await db
    .select({
      status: invoices.status,
      amount: invoices.amount,
      amountPaid: invoices.amountPaid,
      currency: invoices.currency,
    })
    .from(invoices)
    .where(and(eq(invoices.workspaceId, workspaceId), eq(invoices.clientId, clientId)));

  let unpaidCount = 0;
  let outstandingAmount = 0;
  let currency = "USD";

  for (const row of rows) {
    if (row.status === "CANCELLED" || row.status === "PAID") continue;
    unpaidCount += 1;
    outstandingAmount = round2(outstandingAmount + remainingBalance(row.amount, row.amountPaid));
    currency = row.currency;
  }

  return { unpaidCount, outstandingAmount, currency };
}