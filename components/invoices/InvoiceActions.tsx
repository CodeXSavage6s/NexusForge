"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InvoiceShareDialog from "@/components/invoices/InvoiceShareDialog";
import PrintInvoiceButton from "@/components/invoices/PrintInvoiceButton";
import DeleteInvoiceButton from "@/components/invoices/DeleteInvoiceButton";
import RecordPaymentDialog from "@/components/invoices/RecordPaymentDialog";
import { UpdateInvoiceStatus } from "@/lib/actions/invoice";
import {
  MANUALLY_SETTABLE_INVOICE_STATUSES,
  INVOICE_STATUS_LABELS,
} from "@/lib/constants/invoice-constants";
import type { InvoiceStatus } from "@/lib/constants/invoice-constants";

export default function InvoiceActions({
  workspaceId,
  workspaceSlug,
  invoiceId,
  status,
  displayStatus,
  currency,
  remainingBalance,
  publicToken,
}: {
  workspaceId: string;
  workspaceSlug: string;
  invoiceId: string;
  status: InvoiceStatus;
  displayStatus: InvoiceStatus;
  currency: string;
  remainingBalance: number;
  publicToken: string | null;
}) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [isUpdating, setIsUpdating] = useState(false);

  // The dropdown only ever shows/sets DRAFT/SENT/CANCELLED — PAID and
  // PARTIALLY_PAID come from the payment dialog so amountPaid/paidAt stay
  // consistent, and OVERDUE is a derived display state, never stored.
  const dropdownValue = MANUALLY_SETTABLE_INVOICE_STATUSES.includes(
    currentStatus as (typeof MANUALLY_SETTABLE_INVOICE_STATUSES)[number]
  )
    ? currentStatus
    : undefined;

  const isCancelled = currentStatus === "CANCELLED";
  const isFullyPaid = currentStatus === "PAID";

  async function handleStatusChange(nextStatus: string) {
    setIsUpdating(true);
    const result = await UpdateInvoiceStatus(workspaceId, invoiceId, nextStatus as InvoiceStatus);
    setIsUpdating(false);

    if (!result.success) {
      toast.error(result.error ?? "Failed to update status.");
      return;
    }

    setCurrentStatus(nextStatus as InvoiceStatus);
    toast.success("Invoice status updated.");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <Select value={dropdownValue} onValueChange={handleStatusChange} disabled={isUpdating}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder={INVOICE_STATUS_LABELS[displayStatus]} />
        </SelectTrigger>
        <SelectContent>
          {MANUALLY_SETTABLE_INVOICE_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {INVOICE_STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!isCancelled && !isFullyPaid ? (
        <RecordPaymentDialog
          workspaceId={workspaceId}
          invoiceId={invoiceId}
          currency={currency}
          remainingBalance={remainingBalance}
        />
      ) : null}

      <Button asChild variant="outline">
        <Link href={`/${workspaceSlug}/invoices/${invoiceId}/edit`}>
          <Pencil className="mr-1.5 h-4 w-4" />
          Edit
        </Link>
      </Button>

      <InvoiceShareDialog
        workspaceId={workspaceId}
        invoiceId={invoiceId}
        publicToken={publicToken}
      />

      <PrintInvoiceButton />

      <DeleteInvoiceButton
        workspaceId={workspaceId}
        workspaceSlug={workspaceSlug}
        invoiceId={invoiceId}
      />
    </div>
  );
}
