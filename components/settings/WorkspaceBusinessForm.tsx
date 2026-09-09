"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UpdateWorkspaceBusinessInfo } from "@/lib/actions/workspace";
import { INVOICE_CURRENCIES } from "@/lib/constants/invoice-constants";

export interface WorkspaceBusinessFormValues {
  workspaceId: string;
  name: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  taxId: string;
  defaultCurrency: string;
  paymentInstructions: string;
}

export default function WorkspaceBusinessForm({
  initialValues,
}: {
  initialValues: WorkspaceBusinessFormValues;
}) {
  const router = useRouter();
  const [form, setForm] = useState(initialValues);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    setFieldErrors({});

    const result = await UpdateWorkspaceBusinessInfo({
      workspaceId: form.workspaceId,
      name: form.name,
      businessEmail: form.businessEmail,
      businessPhone: form.businessPhone,
      businessAddress: form.businessAddress,
      taxId: form.taxId,
      defaultCurrency: form.defaultCurrency,
      paymentInstructions: form.paymentInstructions,
    });

    setIsSaving(false);

    if (!result.success) {
      setError(result.error ?? "Failed to save workspace.");
      setFieldErrors(result.fieldErrors ?? {});
      toast.error(result.error ?? "Failed to save workspace.");
      return;
    }

    toast.success("Workspace business info updated.");
    router.refresh();
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div>
        <h4 className="mb-1 font-semibold">Business information</h4>
        <p className="text-sm text-muted-foreground">
          This appears on your invoices and the public invoice page your clients see.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="ws-name">Business / workspace name</Label>
          <Input
            id="ws-name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            aria-invalid={!!fieldErrors.name}
          />
          {fieldErrors.name ? <p className="text-sm text-destructive">{fieldErrors.name}</p> : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="ws-currency">Default currency</Label>
          <Select
            value={form.defaultCurrency}
            onValueChange={(value) => setForm((prev) => ({ ...prev, defaultCurrency: value }))}
          >
            <SelectTrigger id="ws-currency" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INVOICE_CURRENCIES.map((code) => (
                <SelectItem key={code} value={code}>
                  {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="ws-email">Business email</Label>
          <Input
            id="ws-email"
            type="email"
            placeholder="hello@yourbusiness.com"
            value={form.businessEmail}
            onChange={(e) => setForm((prev) => ({ ...prev, businessEmail: e.target.value }))}
            aria-invalid={!!fieldErrors.businessEmail}
          />
          {fieldErrors.businessEmail ? (
            <p className="text-sm text-destructive">{fieldErrors.businessEmail}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="ws-phone">Business phone</Label>
          <Input
            id="ws-phone"
            placeholder="+1 (555) 000-0000"
            value={form.businessPhone}
            onChange={(e) => setForm((prev) => ({ ...prev, businessPhone: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="ws-address">Business address</Label>
        <Textarea
          id="ws-address"
          rows={2}
          placeholder="123 Main St, Springfield, USA"
          value={form.businessAddress}
          onChange={(e) => setForm((prev) => ({ ...prev, businessAddress: e.target.value }))}
        />
      </div>

      <div className="grid gap-2 sm:max-w-64">
        <Label htmlFor="ws-tax-id">Tax ID / registration number</Label>
        <Input
          id="ws-tax-id"
          placeholder="Optional"
          value={form.taxId}
          onChange={(e) => setForm((prev) => ({ ...prev, taxId: e.target.value }))}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="ws-payment-instructions">Payment instructions</Label>
        <Textarea
          id="ws-payment-instructions"
          rows={3}
          placeholder="e.g. Bank transfer — Acme Bank, Acct #12345 · or PayPal: you@business.com"
          value={form.paymentInstructions}
          onChange={(e) => setForm((prev) => ({ ...prev, paymentInstructions: e.target.value }))}
        />
        <p className="text-xs text-muted-foreground">
          Shown on invoices as plain text. Avoid pasting sensitive bank credentials — NexusForge
          doesn&apos;t currently offer secure storage for those.
        </p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex justify-end border-t border-border pt-4">
        <Button type="button" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
