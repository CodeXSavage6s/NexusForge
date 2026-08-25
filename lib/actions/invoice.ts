"use server";

import db from "@/database";
import { invoices } from "@/database/schema/schema";
import { and, eq } from "drizzle-orm";
import { requireWorkspaceAccess } from "@/lib/authz";

type CreateInvoiceInput = {
  workspaceId: string;
  clientId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  issueDate: Date;
  dueDate: Date;
};

export async function createInvoice(input: CreateInvoiceInput) {
  await requireWorkspaceAccess(input.workspaceId);

  return db
    .insert(invoices)
    .values({
      workspaceId: input.workspaceId,
      clientId: input.clientId,
      invoiceNumber: input.invoiceNumber,
      amount: input.amount,
      currency: input.currency,
      issueDate: input.issueDate,
      dueDate: input.dueDate,
      status: "DRAFT",
    })
    .returning();
}

export async function getClientInvoices(
  workspaceId: string,
  clientId: string
) {
  await requireWorkspaceAccess(workspaceId);

  return db.query.invoices.findMany({
    where: and(
      eq(invoices.workspaceId, workspaceId),
      eq(invoices.clientId, clientId)
    ),
    orderBy: (invoices, { desc }) => [
      desc(invoices.createdAt),
    ],
  });
}

export async function updateInvoiceStatus(
  workspaceId: string,
  invoiceId: string,
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED"
) {
  await requireWorkspaceAccess(workspaceId);

  return db
    .update(invoices)
    .set({
      status,
    })
    .where(
      and(
        eq(invoices.id, invoiceId),
        eq(invoices.workspaceId, workspaceId)
      )
    )
    .returning();
}