"use client";

import { Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { lineItemAmount } from "@/lib/invoices/calculations";
import type { InvoiceLineItemFormValue } from "@/types/invoice";

interface InvoiceLineItemsEditorProps {
  items: InvoiceLineItemFormValue[];
  onChange: (items: InvoiceLineItemFormValue[]) => void;
  currency?: string;
  error?: string;
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

let keyCounter = 0;
function nextKey() {
  keyCounter += 1;
  return `line-${Date.now()}-${keyCounter}`;
}

export function newLineItem(): InvoiceLineItemFormValue {
  return { key: nextKey(), description: "", quantity: "1", rate: "" };
}

export default function InvoiceLineItemsEditor({
  items,
  onChange,
  currency = "USD",
  error,
}: InvoiceLineItemsEditorProps) {
  function updateItem(key: string, patch: Partial<InvoiceLineItemFormValue>) {
    onChange(items.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  function removeItem(key: string) {
    onChange(items.filter((item) => item.key !== key));
  }

  function addItem() {
    onChange([...items, newLineItem()]);
  }

  return (
    <div className="space-y-3">
      <div className="hidden gap-2 px-1 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[1fr_5rem_6rem_5rem_2rem]">
        <span>Description</span>
        <span>Qty</span>
        <span>Rate</span>
        <span className="text-right">Amount</span>
        <span />
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const quantity = parseFloat(item.quantity) || 0;
          const rate = parseFloat(item.rate) || 0;
          const amount = lineItemAmount({ quantity, rate });

          return (
            <div
              key={item.key}
              className="grid grid-cols-2 gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_5rem_6rem_5rem_2rem] sm:items-center sm:rounded-none sm:border-0 sm:p-0"
            >
              <div className="col-span-2 sm:col-span-1">
                <Label className="mb-1 block text-xs text-muted-foreground sm:hidden">
                  Description
                </Label>
                <Input
                  placeholder="Website design"
                  value={item.description}
                  onChange={(e) => updateItem(item.key, { description: e.target.value })}
                />
              </div>

              <div>
                <Label className="mb-1 block text-xs text-muted-foreground sm:hidden">Qty</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="decimal"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.key, { quantity: e.target.value })}
                />
              </div>

              <div>
                <Label className="mb-1 block text-xs text-muted-foreground sm:hidden">Rate</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={item.rate}
                  onChange={(e) => updateItem(item.key, { rate: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between sm:justify-end">
                <span className="text-xs text-muted-foreground sm:hidden">Amount</span>
                <span className="text-sm font-medium tabular-nums">
                  {formatMoney(amount, currency)}
                </span>
              </div>

              <div className="flex justify-end sm:justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeItem(item.key)}
                  disabled={items.length === 1}
                  aria-label="Remove line item"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="button" variant="outline" size="sm" onClick={addItem}>
        <Plus className="mr-1.5 h-4 w-4" />
        Add item
      </Button>
    </div>
  );
}
