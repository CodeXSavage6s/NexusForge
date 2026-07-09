import Greetings from '@/components/dashboard/Greetings'
import InfoCard from '@/components/dashboard/InfoCard'
import ClientCard from '@/components/dashboard/ClientCard'
import { demoInfoCards, demoClients } from '@/lib/constants/dashboard-constants'
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { ProjectsCount } from "@/lib/actions/project"
import { ClientCount } from "@/lib/actions/client"
import { getWorkspace, getUserWorkspaces } from "@/lib/actions/workspace"

export default async function WorkspaceDashboard({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: workspaceId } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect('/sign-in');

  const workspace = await getWorkspace(workspaceId);
  if (!workspace) notFound();

  // Verify user owns or belongs to this workspace
  const userWorkspaces = await getUserWorkspaces(session.user.id);
  const hasAccess = userWorkspaces.some(w => w.id === workspaceId);
  if (!hasAccess) notFound();

  const user = session.user
  const projectCount = await ProjectsCount(workspaceId)
  const clientCount = await ClientCount(workspaceId)

  return (
    <div className="flex flex-col gap-2 p-2">
      <Greetings user={user.name} projectCount={projectCount} clientCount={clientCount} />

      <section className="grid grid-cols-2 mid:grid-cols-4 gap-2">
        {demoInfoCards.map((card) => (
          <InfoCard key={card.title} {...card} />
        ))}
      </section>

      <ClientCard title="Clients" clients={demoClients} />
    </div>
  )
}
