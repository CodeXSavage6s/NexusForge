import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getWorkspace } from "@/lib/actions/workspace";
import { GetInvoiceDetails } from "@/lib/actions/invoice";
import { calculateTotal } from "@/lib/invoices/calculations";
import InvoiceActions from "@/components/invoices/InvoiceActions";
import InvoicePreview from "@/components/invoices/InvoicePreview";

export default async function InvoiceDetailPage({
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

  const { subtotal, tax, total } = calculateTotal(invoice.lineItems, invoice.taxRate);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <div className="flex flex-col gap-4 print:hidden">
        <Link
          href={`/${workspaceSlug}/invoices`}
          className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Invoices
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
          <InvoiceActions
            workspaceId={workspace.id}
            workspaceSlug={workspaceSlug}
            invoiceId={invoice.id}
            status={invoice.status}
            publicToken={invoice.publicToken}
          />
        </div>
      </div>

      <InvoicePreview
        invoiceNumber={invoice.invoiceNumber}
        status={invoice.status}
        issueDate={invoice.issueDate}
        dueDate={invoice.dueDate}
        currency={invoice.currency}
        notes={invoice.notes}
        taxRate={invoice.taxRate}
        subtotal={subtotal}
        tax={tax}
        total={total}
        lineItems={invoice.lineItems}
        business={{ name: workspace.name, logoUrl: workspace.logo }}
        client={{
          name: invoice.client.name,
          email: invoice.client.email,
          address: invoice.client.address,
        }}
      />
    </div>
  );
}
