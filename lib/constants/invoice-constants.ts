export const INVOICE_STATUSES = [
  "DRAFT",
  "SENT",
  "PAID",
  "OVERDUE",
  "CANCELLED",
] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  PAID: "Paid",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
};

// Tailwind classes per status, applied directly (unlike client.status which
// referenced a class that was never defined in globals.css).
export const INVOICE_STATUS_STYLES: Record<InvoiceStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground border border-border",
  SENT: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
  PAID: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
  OVERDUE: "bg-destructive/10 text-destructive border border-destructive/20",
  CANCELLED: "bg-muted text-muted-foreground border border-border line-through",
};
