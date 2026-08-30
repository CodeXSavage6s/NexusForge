import InvoiceStatusBadge from "@/components/invoices/InvoiceStatusBadge";
import InvoiceSummary from "@/components/invoices/InvoiceSummary";
import type { InvoiceStatus } from "@/lib/constants/invoice-constants";

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export interface InvoicePreviewProps {
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  currency: string;
  notes: string | null;
  taxRate: number | null;
  subtotal: number;
  tax: number;
  total: number;
  lineItems: { id: string; description: string; quantity: number; rate: number }[];
  business: { name: string; logoUrl?: string | null };
  client: { name: string; email?: string | null; address?: string | null };
}

export default function InvoicePreview({
  invoiceNumber,
  status,
  issueDate,
  dueDate,
  currency,
  notes,
  taxRate,
  subtotal,
  tax,
  total,
  lineItems,
  business,
  client,
}: InvoicePreviewProps) {
  return (
    <div
      id="invoice-preview"
      className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-10 print:m-0 print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none"
    >
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-start">
        <div>
          {business.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={business.logoUrl} alt={business.name} className="mb-2 h-10 w-auto" />
          ) : null}
          <p className="font-semibold">{business.name}</p>
        </div>
        <div className="text-left sm:text-right">
          <h1 className="text-2xl font-bold tracking-tight">INVOICE</h1>
          <p className="text-sm text-muted-foreground">#{invoiceNumber}</p>
          <div className="mt-2">
            <InvoiceStatusBadge status={status} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 py-6 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">From</p>
          <p className="mt-1 font-medium">{business.name}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Bill To</p>
          <p className="mt-1 font-medium">{client.name}</p>
          {client.email ? <p className="text-sm text-muted-foreground">{client.email}</p> : null}
          {client.address ? (
            <p className="text-sm text-muted-foreground">{client.address}</p>
          ) : null}
        </div>
        <div className="flex gap-6 sm:flex-col sm:gap-1">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Issue Date</p>
            <p className="mt-1 font-medium">{formatDate(issueDate)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Due Date</p>
            <p className="mt-1 font-medium">{formatDate(dueDate)}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="hidden gap-2 border-b border-border py-2 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[1fr_4rem_6rem_6rem]">
          <span>Description</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Rate</span>
          <span className="text-right">Amount</span>
        </div>

        {lineItems.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-2 gap-1 border-b border-border py-3 text-sm sm:grid-cols-[1fr_4rem_6rem_6rem] sm:items-center"
          >
            <span className="col-span-2 font-medium sm:col-span-1 sm:font-normal">
              {item.description}
            </span>
            <span className="text-muted-foreground sm:text-right">Qty {item.quantity}</span>
            <span className="text-muted-foreground sm:text-right">
              {formatMoney(item.rate, currency)}
            </span>
            <span className="text-right font-medium tabular-nums">
              {formatMoney(item.quantity * item.rate, currency)}
            </span>
          </div>
        ))}
      </div>

      <div className="py-6">
        <InvoiceSummary subtotal={subtotal} tax={tax} total={total} taxRate={taxRate} currency={currency} />
      </div>

      {notes ? (
        <div className="border-t border-border pt-6">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Notes</p>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{notes}</p>
        </div>
      ) : null}
    </div>
  );
}
