import Link from "next/link";
import { FolderKanban } from "lucide-react";
import InvoiceStatusBadge from "@/components/invoices/InvoiceStatusBadge";
import type { InvoiceListItem } from "@/types/invoice";

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function InvoiceCard({
  invoice,
  workspaceSlug,
}: {
  invoice: InvoiceListItem;
  workspaceSlug: string;
}) {
  return (
    <Link
      href={`/${workspaceSlug}/invoices/${invoice.id}`}
      className="flex flex-col gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{invoice.invoiceNumber}</span>
          <InvoiceStatusBadge status={invoice.status} />
        </div>
        <span className="text-sm text-muted-foreground">{invoice.client.name}</span>
        {invoice.project ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <FolderKanban className="h-3 w-3" /> {invoice.project.name}
          </span>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-6 sm:flex-col sm:items-end sm:justify-center sm:gap-1">
        <span className="text-lg font-semibold tabular-nums">
          {formatMoney(invoice.amount, invoice.currency)}
        </span>
        <span className="text-xs text-muted-foreground">
          Issued {formatDate(invoice.issueDate)} · Due {formatDate(invoice.dueDate)}
        </span>
      </div>
    </Link>
  );
}
