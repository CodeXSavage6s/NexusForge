"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteInvoice } from "@/lib/actions/invoice";

export default function DeleteInvoiceButton({
  workspaceId,
  workspaceSlug,
  invoiceId,
}: {
  workspaceId: string;
  workspaceSlug: string;
  invoiceId: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this invoice? This action cannot be undone."
    );
    if (!confirmed) return;

    setIsDeleting(true);
    const result = await DeleteInvoice(workspaceId, invoiceId);
    setIsDeleting(false);

    if (!result.success) {
      toast.error(result.error ?? "Failed to delete invoice.");
      return;
    }

    toast.success("Invoice deleted.");
    router.push(`/${workspaceSlug}/invoices`);
    router.refresh();
  }

  return (
    <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
      <Trash2 className="mr-1.5 h-4 w-4" />
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  );
}
