import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getWorkspace } from "@/lib/actions/workspace";
import { GetWorkspaceInvoices } from "@/lib/actions/invoice";
import { Button } from "@/components/ui/button";
import InvoicesList from "@/components/invoices/InvoicesList";

export default async function InvoicesPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: workspaceSlug } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const workspace = await getWorkspace(workspaceSlug, session.user.id);
  if (!workspace) notFound();

  const { invoices } = await GetWorkspaceInvoices(workspace.id);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage invoices for your clients.
          </p>
        </div>
        <Button asChild>
          <Link href={`/${workspaceSlug}/invoices/new`}>
            <Plus className="mr-1.5 h-4 w-4" />
            Create Invoice
          </Link>
        </Button>
      </div>

      <InvoicesList invoices={invoices} workspaceSlug={workspaceSlug} />
    </div>
  );
}
