import { cn } from "@/lib/utils";
import {
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_STYLES,
  type InvoiceStatus,
} from "@/lib/constants/invoice-constants";

export default function InvoiceStatusBadge({
  status,
  className,
}: {
  status: InvoiceStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        INVOICE_STATUS_STYLES[status],
        className
      )}
    >
      {INVOICE_STATUS_LABELS[status]}
    </span>
  );
}
