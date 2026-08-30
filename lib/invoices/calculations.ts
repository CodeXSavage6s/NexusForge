// Pure calculation helpers for invoices.
//
// These are intentionally framework-agnostic (no "use client" / "use server")
// so the exact same math can run in the browser for instant totals AND on
// the server as the authoritative recalculation before anything is persisted.
// Never trust a total computed only on the client.

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
