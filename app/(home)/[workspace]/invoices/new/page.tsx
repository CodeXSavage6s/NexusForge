import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getWorkspace } from "@/lib/actions/workspace";
import { GetWorkspaceClient } from "@/lib/actions/client";
import { GetWorkspaceProjects } from "@/lib/actions/project";
import { SuggestNextInvoiceNumber } from "@/lib/actions/invoice";
import InvoiceForm from "@/components/invoices/InvoiceForm";

export default async function NewInvoicePage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: workspaceSlug } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const workspace = await getWorkspace(workspaceSlug, session.user.id);
  if (!workspace) notFound();

  const [clientsResponse, projectsResponse, suggestedInvoiceNumber] = await Promise.all([
    GetWorkspaceClient(workspace.id),
    GetWorkspaceProjects(workspace.id),
    SuggestNextInvoiceNumber(workspace.id),
  ]);

  const clients = (clientsResponse.client ?? []).map((c) => ({ id: c.id, name: c.name }));
  const projects = (projectsResponse.projects ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    clientId: p.client.id,
  }));

  return (
    <InvoiceForm
      workspaceId={workspace.id}
      workspaceSlug={workspaceSlug}
      clients={clients}
      projects={projects}
      suggestedInvoiceNumber={suggestedInvoiceNumber}
      mode="create"
    />
  );
}
