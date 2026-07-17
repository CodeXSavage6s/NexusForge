import { GetWorkspaceClient } from '@/lib/actions/client'
import { getWorkspace } from '@/lib/actions/workspace'
import ClientsFilter from '@/components/dashboard/ClientsFilter'
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ClientsPage({ params }) {
  const { workspace } = await params

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect('/sign-in');

  const user = session.user

  const Workspace = await getWorkspace(workspace, user.id)

  const response = await GetWorkspaceClient(Workspace.id)

  const clients = response.client

  return (
    <div>
      <ClientsFilter clients={clients} />
    </div>
  )
}
