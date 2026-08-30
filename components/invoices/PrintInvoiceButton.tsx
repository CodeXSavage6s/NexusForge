"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrintInvoiceButton({ variant = "outline" as const }) {
  return (
    <Button type="button" variant={variant} onClick={() => window.print()}>
      <Printer className="mr-1.5 h-4 w-4" />
      Print
    </Button>
  );
}
