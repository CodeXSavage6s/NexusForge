// Pure calculation helpers for invoices.
//
// These are intentionally framework-agnostic (no "use client" / "use server")
// so the exact same math can run in the browser for instant totals AND on
// the server as the authoritative recalculation before anything is persisted.
// Never trust a total computed only on the client.

import type { InvoiceStatus } from "@/lib/constants/invoice-constants";

export interface InvoiceLineItemInput {
  description: string;
  quantity: number;
  rate: number;
}

/** Rounds to 2 decimal places, avoiding floating point noise like 10.000000000002. */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function lineItemAmount(item: Pick<InvoiceLineItemInput, "quantity" | "rate">): number {
  const quantity = Number.isFinite(item.quantity) ? item.quantity : 0;
  const rate = Number.isFinite(item.rate) ? item.rate : 0;
  return round2(quantity * rate);
}

export function calculateSubtotal(items: Pick<InvoiceLineItemInput, "quantity" | "rate">[]): number {
  return round2(items.reduce((sum, item) => sum + lineItemAmount(item), 0));
}

export function calculateTax(subtotal: number, taxRate: number | null | undefined): number {
  if (!taxRate || taxRate <= 0) return 0;
  return round2(subtotal * (taxRate / 100));
}

export function calculateTotal(
  items: Pick<InvoiceLineItemInput, "quantity" | "rate">[],
  taxRate: number | null | undefined
): { subtotal: number; tax: number; total: number } {
  const subtotal = calculateSubtotal(items);
  const tax = calculateTax(subtotal, taxRate);
  return { subtotal, tax, total: round2(subtotal + tax) };
}

/** Validates a single line item. Returns an error message, or null if valid. */
export function validateLineItem(item: InvoiceLineItemInput): string | null {
  if (!item.description?.trim()) return "Description is required.";
  if (!Number.isFinite(item.quantity) || item.quantity <= 0) return "Quantity must be greater than 0.";
  if (!Number.isFinite(item.rate) || item.rate < 0) return "Rate must be 0 or greater.";
  return null;
}

export function validateTaxRate(taxRate: number | null | undefined): string | null {
  if (taxRate === null || taxRate === undefined) return null;
  if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
    return "Tax rate must be between 0 and 100.";
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// Payment tracking
// ─────────────────────────────────────────────────────────────

/**
 * Derives the status an invoice should be DISPLAYED as, given its stored
 * status, dueDate, and payment state. Overdue is intentionally never
 * persisted for SENT/PARTIALLY_PAID invoices — it's computed here at read
 * time so it's always correct without a cron job. PAID and CANCELLED never
 * display as overdue regardless of dueDate.
 */
export function deriveInvoiceDisplayStatus(params: {
  status: InvoiceStatus;
  dueDate: Date;
  amountPaid: number;
  amount: number;
  now?: Date;
}): InvoiceStatus {
  const { status, dueDate, now = new Date() } = params;

  if (status === "PAID" || status === "CANCELLED" || status === "DRAFT") {
    return status;
  }

  // status is SENT, PARTIALLY_PAID, or the legacy stored OVERDUE.
  const isPastDue = dueDate.getTime() < now.getTime();
  if (isPastDue) return "OVERDUE";

  return status === "OVERDUE" ? "SENT" : status;
}

/** Remaining balance owed on an invoice, floored at 0 and rounded to cents. */
export function remainingBalance(amount: number, amountPaid: number): number {
  return round2(Math.max(0, amount - amountPaid));
}

/**
 * Validates a payment amount being recorded against an invoice.
 * Returns an error message, or null if valid.
 */
export function validatePaymentAmount(params: {
  amount: number;
  invoiceTotal: number;
  alreadyPaid: number;
}): string | null {
  const { amount, invoiceTotal, alreadyPaid } = params;

  if (!Number.isFinite(amount) || amount <= 0) {
    return "Payment amount must be greater than 0.";
  }

  // Never allow amountPaid to exceed the invoice total (with a tiny epsilon
  // for floating point rounding).
  if (round2(alreadyPaid + amount) - invoiceTotal > 0.005) {
    const remaining = remainingBalance(invoiceTotal, alreadyPaid);
    return `Payment exceeds the remaining balance of ${remaining.toFixed(2)}.`;
  }

  return null;
}

/** Given a total and an amount already paid, what status should the invoice move to. */
export function statusForPaymentState(amountPaid: number, total: number): "PARTIALLY_PAID" | "PAID" {
  return round2(amountPaid) >= round2(total) ? "PAID" : "PARTIALLY_PAID";
}
