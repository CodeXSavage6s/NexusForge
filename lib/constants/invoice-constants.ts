export const INVOICE_STATUSES = [
  "DRAFT",
  "SENT",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
  "CANCELLED",
] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

// Statuses a person can set directly from the status dropdown. PAID and
// PARTIALLY_PAID are only ever reached through the payment-recording flow
// (RecordInvoicePayment / MarkInvoiceAsPaid) so amountPaid/paidAt stay in
// sync with the status. OVERDUE is never stored directly — it's derived at
// read time from dueDate + payment state, see deriveInvoiceDisplayStatus.
export const MANUALLY_SETTABLE_INVOICE_STATUSES = ["DRAFT", "SENT", "CANCELLED"] as const;

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  PARTIALLY_PAID: "Partially Paid",
  PAID: "Paid",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
};

// Tailwind classes per status, applied directly (unlike client.status which
// referenced a class that was never defined in globals.css).
export const INVOICE_STATUS_STYLES: Record<InvoiceStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground border border-border",
  SENT: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
  PARTIALLY_PAID: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
  PAID: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
  OVERDUE: "bg-destructive/10 text-destructive border border-destructive/20",
  CANCELLED: "bg-muted text-muted-foreground border border-border line-through",
};

// Small, sensible currency list for the MVP — not exhaustive, but covers
// the workspaces likely to use this in the near term.
export const INVOICE_CURRENCIES = ["USD", "EUR", "GBP", "NGN", "CAD", "AUD"] as const;
export type InvoiceCurrency = (typeof INVOICE_CURRENCIES)[number];
