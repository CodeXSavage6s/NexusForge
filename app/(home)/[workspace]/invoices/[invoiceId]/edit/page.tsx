import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { getWorkspace } from "@/lib/actions/workspace";
import { GetWorkspaceClient } from "@/lib/actions/client";
import { GetWorkspaceProjects } from "@/lib/actions/project";
import { GetInvoiceDetails } from "@/lib/actions/invoice";
import InvoiceForm from "@/components/invoices/InvoiceForm";
import { newLineItem } from "@/components/invoices/InvoiceLineItemsEditor";
import type { InvoiceLineItemFormValue } from "@/types/invoice";

function toDateInput(date: Date) {
  return new Date(date).toISOString().slice(0, 10);
}

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ workspace: string; invoiceId: string }>;
}) {
  const { workspace: workspaceSlug, invoiceId } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const workspace = await getWorkspace(workspaceSlug, session.user.id);
  if (!workspace) notFound();

  const invoice = await GetInvoiceDetails(workspace.id, invoiceId);
  if (!invoice) notFound();

  const [clientsResponse, projectsResponse] = await Promise.all([
    GetWorkspaceClient(workspace.id),
    GetWorkspaceProjects(workspace.id),
  ]);

  const clients = (clientsResponse.client ?? []).map((c) => ({ id: c.id, name: c.name }));
  const projects = (projectsResponse.projects ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    clientId: p.client.id,
  }));

  const lineItems: InvoiceLineItemFormValue[] = invoice.lineItems.map((item, index) => ({
    key: `existing-${index}-${item.id}`,
    description: item.description,
    quantity: String(item.quantity),
    rate: String(item.rate),
  }));

  return (
    <InvoiceForm
      workspaceId={workspace.id}
      workspaceSlug={workspaceSlug}
      clients={clients}
      projects={projects}
      mode="edit"
      invoiceId={invoice.id}
      initialValues={{
        clientId: invoice.clientId,
        projectId: invoice.projectId,
        invoiceNumber: invoice.invoiceNumber,
        issueDate: toDateInput(invoice.issueDate),
        dueDate: toDateInput(invoice.dueDate),
        taxRate: invoice.taxRate != null ? String(invoice.taxRate) : "",
        notes: invoice.notes ?? "",
        lineItems: lineItems.length > 0 ? lineItems : [newLineItem()],
      }}
    />
  );
}
