"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import InvoiceLineItemsEditor, { newLineItem } from "@/components/invoices/InvoiceLineItemsEditor";
import InvoiceSummary from "@/components/invoices/InvoiceSummary";
import { calculateTotal } from "@/lib/invoices/calculations";
import { CreateInvoice, UpdateInvoice } from "@/lib/actions/invoice";
import type { InvoiceFormValues, InvoiceLineItemFormValue } from "@/types/invoice";

export interface ClientOption {
  id: string;
  name: string;
}

export interface ProjectOption {
  id: string;
  name: string;
  clientId: string;
}

interface InvoiceFormProps {
  workspaceId: string;
  workspaceSlug: string;
  clients: ClientOption[];
  projects: ProjectOption[];
  suggestedInvoiceNumber?: string;
  mode: "create" | "edit";
  invoiceId?: string;
  initialValues?: InvoiceFormValues;
}

const NO_PROJECT = "__none__";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function defaultDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

function buildInitialValues(suggestedInvoiceNumber?: string): InvoiceFormValues {
  return {
    clientId: "",
    projectId: null,
    invoiceNumber: suggestedInvoiceNumber ?? "",
    issueDate: todayISO(),
    dueDate: defaultDueDate(),
    taxRate: "",
    notes: "",
    lineItems: [newLineItem()],
  };
}

export default function InvoiceForm({
  workspaceId,
  workspaceSlug,
  clients,
  projects,
  suggestedInvoiceNumber,
  mode,
  invoiceId,
  initialValues,
}: InvoiceFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<InvoiceFormValues>(
    initialValues ?? buildInitialValues(suggestedInvoiceNumber)
  );
  const [isSubmitting, setIsSubmitting] = useState<"draft" | "create" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const projectsForClient = useMemo(
    () => projects.filter((p) => p.clientId === form.clientId),
    [projects, form.clientId]
  );

  const numericLineItems = useMemo(
    () =>
      form.lineItems.map((item) => ({
        description: item.description,
        quantity: parseFloat(item.quantity) || 0,
        rate: parseFloat(item.rate) || 0,
      })),
    [form.lineItems]
  );

  const taxRateValue = form.taxRate.trim() === "" ? null : parseFloat(form.taxRate);
  const { subtotal, tax, total } = calculateTotal(numericLineItems, taxRateValue);

  function setLineItems(lineItems: InvoiceLineItemFormValue[]) {
    setForm((prev) => ({ ...prev, lineItems }));
  }

  function handleClientChange(clientId: string) {
    setForm((prev) => ({
      ...prev,
      clientId,
      // Drop any previously selected project if it doesn't belong to the new client.
      projectId:
        prev.projectId && projects.some((p) => p.id === prev.projectId && p.clientId === clientId)
          ? prev.projectId
          : null,
    }));
  }

  async function handleSubmit(intent: "draft" | "create") {
    setError(null);
    setFieldErrors({});

    if (!form.clientId) {
      setFieldErrors({ clientId: "Client is required." });
      return;
    }

    setIsSubmitting(intent);

    try {
      const payload = {
        workspaceId,
        clientId: form.clientId,
        projectId: form.projectId,
        invoiceNumber: form.invoiceNumber.trim(),
        issueDate: new Date(form.issueDate),
        dueDate: new Date(form.dueDate),
        taxRate: taxRateValue,
        notes: form.notes,
        lineItems: numericLineItems,
      };

      const result =
        mode === "edit" && invoiceId
          ? await UpdateInvoice(invoiceId, payload)
          : await CreateInvoice(payload);

      if (!result.success || !result.invoiceId) {
        setError(result.error ?? "Failed to save invoice.");
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      router.refresh();
      if (intent === "draft") {
        router.push(`/${workspaceSlug}/invoices`);
      } else {
        router.push(`/${workspaceSlug}/invoices/${result.invoiceId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save invoice.");
    } finally {
      setIsSubmitting(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <h1 className="text-2xl font-bold">{mode === "edit" ? "Edit Invoice" : "Create Invoice"}</h1>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="client">Client</Label>
            <Select value={form.clientId} onValueChange={handleClientChange}>
              <SelectTrigger id="client" className="w-full" aria-invalid={!!fieldErrors.clientId}>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No clients yet — add one first.
                  </div>
                ) : (
                  clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {fieldErrors.clientId ? (
              <p className="text-sm text-destructive">{fieldErrors.clientId}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project">
              Project <span className="text-muted-foreground">Optional</span>
            </Label>
            <Select
              value={form.projectId ?? NO_PROJECT}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, projectId: value === NO_PROJECT ? null : value }))
              }
              disabled={!form.clientId}
            >
              <SelectTrigger id="project" className="w-full">
                <SelectValue placeholder="No project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_PROJECT}>No project</SelectItem>
                {projectsForClient.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="invoiceNumber">Invoice number</Label>
            <Input
              id="invoiceNumber"
              placeholder="INV-0001"
              value={form.invoiceNumber}
              onChange={(e) => setForm((prev) => ({ ...prev, invoiceNumber: e.target.value }))}
              aria-invalid={!!fieldErrors.invoiceNumber}
            />
            {fieldErrors.invoiceNumber ? (
              <p className="text-sm text-destructive">{fieldErrors.invoiceNumber}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="issueDate">Issue date</Label>
            <Input
              id="issueDate"
              type="date"
              value={form.issueDate}
              onChange={(e) => setForm((prev) => ({ ...prev, issueDate: e.target.value }))}
              aria-invalid={!!fieldErrors.issueDate}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dueDate">Due date</Label>
            <Input
              id="dueDate"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
              aria-invalid={!!fieldErrors.dueDate}
            />
            {fieldErrors.dueDate ? (
              <p className="text-sm text-destructive">{fieldErrors.dueDate}</p>
            ) : null}
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <h2 className="mb-3 text-sm font-semibold">Line Items</h2>
          <InvoiceLineItemsEditor
            items={form.lineItems}
            onChange={setLineItems}
            error={fieldErrors.lineItems}
          />
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:justify-between">
          <div className="grid max-w-40 gap-2">
            <Label htmlFor="taxRate">Tax %</Label>
            <Input
              id="taxRate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="0"
              value={form.taxRate}
              onChange={(e) => setForm((prev) => ({ ...prev, taxRate: e.target.value }))}
              aria-invalid={!!fieldErrors.taxRate}
            />
            {fieldErrors.taxRate ? (
              <p className="text-sm text-destructive">{fieldErrors.taxRate}</p>
            ) : null}
          </div>

          <InvoiceSummary subtotal={subtotal} tax={tax} total={total} taxRate={taxRateValue} />
        </div>

        <div className="grid gap-2 border-t border-border pt-4">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Optional notes for your client"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/${workspaceSlug}/invoices`)}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => handleSubmit("draft")}
          disabled={isSubmitting !== null}
        >
          {isSubmitting === "draft" ? "Saving..." : "Save Draft"}
        </Button>
        <Button type="button" onClick={() => handleSubmit("create")} disabled={isSubmitting !== null}>
          {isSubmitting === "create"
            ? "Saving..."
            : mode === "edit"
              ? "Save Changes"
              : "Create Invoice"}
        </Button>
      </div>
    </div>
  );
}
