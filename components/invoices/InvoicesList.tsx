"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InvoiceCard from "@/components/invoices/InvoiceCard";
import { INVOICE_STATUSES, INVOICE_STATUS_LABELS } from "@/lib/constants/invoice-constants";
import type { InvoiceListItem } from "@/types/invoice";

const ALL = "ALL";

export default function InvoicesList({
  invoices,
  workspaceSlug,
}: {
  invoices: InvoiceListItem[];
  workspaceSlug: string;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>(ALL);
  const [clientId, setClientId] = useState<string>(ALL);

  const clientOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const invoice of invoices) seen.set(invoice.client.id, invoice.client.name);
    return Array.from(seen, ([id, name]) => ({ id, name }));
  }, [invoices]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      if (status !== ALL && invoice.status !== status) return false;
      if (clientId !== ALL && invoice.client.id !== clientId) return false;
      if (!query) return true;

      return (
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        invoice.client.name.toLowerCase().includes(query) ||
        (invoice.project?.name.toLowerCase().includes(query) ?? false)
      );
    });
  }, [invoices, search, status, clientId]);

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border p-12 text-center">
        <h3 className="text-lg font-semibold">No invoices yet.</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Create your first invoice to start tracking client payments.
        </p>
        <Button asChild>
          <Link href={`/${workspaceSlug}/invoices/new`}>
            <Plus className="mr-1.5 h-4 w-4" />
            Create Invoice
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="search"
          placeholder="Search by invoice #, client, or project"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:flex-1"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              <SelectItem value={ALL}>All statuses</SelectItem>
              {INVOICE_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {INVOICE_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select value={clientId} onValueChange={setClientId}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Client" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Client</SelectLabel>
              <SelectItem value={ALL}>All clients</SelectItem>
              {clientOptions.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No invoices match your filters.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} workspaceSlug={workspaceSlug} />
          ))}
        </div>
      )}
    </div>
  );
}
