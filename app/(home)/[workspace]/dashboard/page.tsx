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
  const { workspace: workspaceSlug } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect('/sign-in');
  
  const user = session?.user

  // Verify user owns or belongs to this workspace
  const userWorkspaces = await getUserWorkspaces(session.user.id);
  const hasAccess = userWorkspaces.some(w => w.slug === workspaceSlug);
  if (!hasAccess) notFound();

  const workspace = await getWorkspace(workspaceSlug, user.id);
  if (!workspace) notFound();
  
  console.log("From Client", workspace)

  const projectCount = await ProjectsCount(workspace.id)
  const clientCount = await ClientCount(workspace.id)

  return (
    <div className="flex flex-col gap-2 p-2">
      <Greetings user={user.name} projectCount={projectCount} clientCount={clientCount}
        workspaceId={workspace.id}/>

      <section className="grid grid-cols-2 mid:grid-cols-4 gap-2">
        {demoInfoCards.map((card) => (
          <InfoCard key={card.title} {...card} />
        ))}
      </section>

      <ClientCard title="Clients" clients={demoClients} />
    </div>
  )
}
