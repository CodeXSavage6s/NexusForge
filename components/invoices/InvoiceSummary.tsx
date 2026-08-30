function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

export default function InvoiceSummary({
  subtotal,
  tax,
  total,
  taxRate,
  currency = "USD",
}: {
  subtotal: number;
  tax: number;
  total: number;
  taxRate?: number | null;
  currency?: string;
}) {
  return (
    <div className="ml-auto w-full max-w-64 space-y-2 text-sm">
      <div className="flex justify-between text-muted-foreground">
        <span>Subtotal</span>
        <span className="tabular-nums text-foreground">{formatMoney(subtotal, currency)}</span>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <span>Tax{taxRate ? ` (${taxRate}%)` : ""}</span>
        <span className="tabular-nums text-foreground">{formatMoney(tax, currency)}</span>
      </div>
      <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
        <span>Total</span>
        <span className="tabular-nums">{formatMoney(total, currency)}</span>
      </div>
    </div>
  );
}
