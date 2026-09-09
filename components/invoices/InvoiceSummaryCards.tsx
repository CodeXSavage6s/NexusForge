import type { InvoiceSummaryTotals } from "@/types/invoice";

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

export default function InvoiceSummaryCards({ summary }: { summary: InvoiceSummaryTotals }) {
  const cards = [
    { label: "Total invoiced", value: summary.totalInvoiced, tone: "text-foreground" },
    { label: "Paid", value: summary.totalPaid, tone: "text-emerald-600 dark:text-emerald-400" },
    { label: "Outstanding", value: summary.totalOutstanding, tone: "text-amber-600 dark:text-amber-400" },
    {
      label: "Overdue",
      value: summary.totalOverdue,
      tone: "text-destructive",
      caption: summary.overdueCount > 0 ? `${summary.overdueCount} invoice${summary.overdueCount === 1 ? "" : "s"}` : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-border bg-card p-3">
          <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
          <p className={`mt-1 text-lg font-semibold tabular-nums ${card.tone}`}>
            {formatMoney(card.value, summary.currency)}
          </p>
          {card.caption ? <p className="text-xs text-muted-foreground">{card.caption}</p> : null}
        </div>
      ))}
    </div>
  );
}
