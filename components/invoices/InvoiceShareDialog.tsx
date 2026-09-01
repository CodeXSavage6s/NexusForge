"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GeneratePublicInvoiceToken } from "@/lib/actions/invoice";

export default function InvoiceShareDialog({
  workspaceId,
  invoiceId,
  publicToken,
}: {
  workspaceId: string;
  invoiceId: string;
  publicToken: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState(publicToken);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicUrl =
    token && typeof window !== "undefined" ? `${window.location.origin}/invoice/${token}` : "";

  async function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    setCopied(false);

    if (nextOpen && !token && !loading) {
      setLoading(true);
      setError(null);
      const result = await GeneratePublicInvoiceToken(workspaceId, invoiceId);
      setLoading(false);

      if (!result.success || !result.publicToken) {
        setError(result.error ?? "Failed to generate link.");
        return;
      }
      setToken(result.publicToken);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy automatically — copy the link manually.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <Share2 className="mr-1.5 h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Invoice</DialogTitle>
          <DialogDescription>Anyone with this link can view this invoice.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground">Generating link...</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <div className="flex gap-2">
            <Input value={publicUrl} readOnly onFocus={(e) => e.target.select()} />
            <Button type="button" onClick={handleCopy} variant="secondary" className="shrink-0">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy Link"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
