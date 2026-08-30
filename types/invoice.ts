import type { InvoiceStatus } from "@/lib/constants/invoice-constants";

export type { InvoiceStatus };

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  rate: number;
  createdAt: Date;
}

export interface Invoice {
  id: string;
  workspaceId: string;
  clientId: string;
  projectId: string | null;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  taxRate: number | null;
  notes: string | null;
  publicToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Invoice + line items + the minimal client/project info needed to render it. */
export interface InvoiceWithDetails extends Invoice {
  lineItems: InvoiceLineItem[];
  client: {
    id: string;
    name: string;
    companyName: string | null;
    email: string | null;
    address: string | null;
  };
  project: {
    id: string;
    name: string;
  } | null;
}

/** What the invoice list page needs per row/card — no need to fetch full line items. */
export interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  client: { id: string; name: string };
  project: { id: string; name: string } | null;
}

/** Shape the public /invoice/[publicToken] page is allowed to see — nothing more. */
export interface PublicInvoiceView {
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  taxRate: number | null;
  notes: string | null;
  lineItems: { id: string; description: string; quantity: number; rate: number }[];
  business: { name: string; logo: string | null };
  client: { name: string; email: string | null; address: string | null };
}

export interface InvoiceLineItemFormValue {
  key: string; // client-side only key for React list rendering / stable row identity
  description: string;
  quantity: string; // kept as string while editing, parsed on submit
  rate: string;
}

export interface InvoiceFormValues {
  clientId: string;
  projectId: string | null;
  invoiceNumber: string;
  issueDate: string; // yyyy-mm-dd
  dueDate: string; // yyyy-mm-dd
  taxRate: string; // kept as string while editing
  notes: string;
  lineItems: InvoiceLineItemFormValue[];
}

export interface InvoiceActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  invoiceId?: string;
  invoice?: Invoice;
}
