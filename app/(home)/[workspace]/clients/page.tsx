import { GetWorkspaceClient } from '@/lib/actions/client'
import { getWorkspace } from '@/lib/actions/workspace'
import ClientsFilter from '@/components/dashboard/ClientsFilter'
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

export default async function ClientsPage({ params }: { params: Promise<{ workspace: string }> }) {
  const { workspace } = await params

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect('/sign-in');

  const user = session.user

  const Workspace = await getWorkspace(workspace, user.id)
  if (!Workspace) notFound()

  const response = await GetWorkspaceClient(Workspace.id)

  const clients = response.client ?? []

  return (
    <div>
      <ClientsFilter clients={clients} workspaceId={workspace} />
    </div>
  )
}
