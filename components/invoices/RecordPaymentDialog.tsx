"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HandCoins, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MarkInvoiceAsPaid, RecordInvoicePayment } from "@/lib/actions/invoice";

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

export default function RecordPaymentDialog({
  workspaceId,
  invoiceId,
  currency,
  remainingBalance,
  disabled,
}: {
  workspaceId: string;
  invoiceId: string;
  currency: string;
  remainingBalance: number;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(remainingBalance > 0 ? remainingBalance.toFixed(2) : "");
  const [method, setMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState<"partial" | "full" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRecordPayment() {
    setError(null);
    const parsed = parseFloat(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Enter a payment amount greater than 0.");
      return;
    }

    setIsSubmitting("partial");
    const result = await RecordInvoicePayment(workspaceId, invoiceId, {
      amount: parsed,
      method: method.trim() || null,
    });
    setIsSubmitting(null);

    if (!result.success) {
      setError(result.error ?? "Failed to record payment.");
      return;
    }

    toast.success("Payment recorded.");
    setOpen(false);
    router.refresh();
  }

  async function handleMarkPaid() {
    setError(null);
    setIsSubmitting("full");
    const result = await MarkInvoiceAsPaid(workspaceId, invoiceId, { method: method.trim() || null });
    setIsSubmitting(null);

    if (!result.success) {
      setError(result.error ?? "Failed to mark invoice as paid.");
      return;
    }

    toast.success("Invoice marked as paid.");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" disabled={disabled}>
          <HandCoins className="mr-1.5 h-4 w-4" />
          Record Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Remaining balance: {formatMoney(remainingBalance, currency)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="payment-amount">Amount ({currency})</Label>
            <Input
              id="payment-amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="payment-method">
              Payment method <span className="text-muted-foreground">Optional</span>
            </Label>
            <Input
              id="payment-method"
              placeholder="Bank transfer, card, PayPal..."
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button type="button" onClick={handleRecordPayment} disabled={isSubmitting !== null}>
            {isSubmitting === "partial" ? "Recording..." : "Record Payment"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleMarkPaid}
            disabled={isSubmitting !== null}
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            {isSubmitting === "full" ? "Saving..." : "Mark Fully Paid"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
