import Greetings from '@/components/dashboard/Greetings'
import InfoCard from '@/components/dashboard/InfoCard'
import ClientCard from '@/components/dashboard/ClientCard'
import { demoInfoCards, demoClients } from '@/lib/constants/dashboard-constants'
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { ProjectsCount } from "@/lib/actions/project"
import { ClientCount } from "@/lib/actions/client"
import { getWorkspace } from "@/lib/actions/workspace"

export default async function WorkspaceDashboard({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect('/sign-in');

  // TODO: getWorkspace should also confirm this user owns/belongs to it
  const workspace = await getWorkspace(workspaceId);
  if (!workspace) notFound();

  const user = session.user
  // TODO: update ProjectsCount / ClientCount to accept workspaceId and
  // filter by it (they're currently unscoped from the old single-user schema)
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
