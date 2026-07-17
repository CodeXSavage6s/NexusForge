import Greetings from '@/components/dashboard/Greetings'
import InfoCard from '@/components/dashboard/InfoCard'
import ClientBox from '@/components/dashboard/ClientBox'
import { demoClients } from '@/lib/constants/dashboard-constants'
import { Users, FolderKanban, CalendarCheck, DollarSign } from 'lucide-react'
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { ProjectsCount } from "@/lib/actions/project"
import { ClientCount, GetWorkspaceClient } from "@/lib/actions/client"
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

  const projectCount = await ProjectsCount(workspace.id)
  const clientCount = await ClientCount(workspace.id)

  const clients = await GetWorkspaceClient(workspace.id)
  return (
    <div className="flex flex-col gap-2 p-2">
      <Greetings user={user.name} projectCount={projectCount} clientCount={clientCount}
        workspaceId={workspace.id}/>

      <div className="grid grid-cols-2 mid:grid-cols-4 gap-2">
        <InfoCard
          title="Clients"
          href="/clients"
          icon={Users}
          iconBg="rgba(224,17,228,0.15)"
          iconColor="#e011e4"
          subtitleColor="#e011e4"
          progressColor="#e011e4"
          caption="Free plan: 10 max"
          count={clientCount} 
          subtitle={undefined} 
          progress={undefined} 
        />

        <InfoCard
          title="Projects"
          href="/projects"
          icon={FolderKanban}
          iconBg="rgba(59,130,246,0.15)"
          iconColor="#3b82f6"
          subtitleColor="#3b82f6"
          progressColor="#3b82f6"
          caption="Free plan: 20 max"
          count={projectCount}
          subtitle={undefined} 
          progress={undefined} 
        />

        <InfoCard
          title="Tasks Due"
          href="/tasks"
          icon={CalendarCheck}
          iconBg="rgba(249,115,22,0.15)"
          iconColor="#f97316"
          subtitleColor="#ef4444"
          progressColor="#ef4444"
          count={undefined} 
          subtitle={undefined} 
          progress={undefined} 
        />

        <InfoCard
          title="Invoices"
          href="/invoices"
          icon={DollarSign}
          iconBg="rgba(34,197,94,0.15)"
          iconColor="#22c55e"
          subtitleColor="#22c55e"
          progressColor="#22c55e"
          count={undefined} 
          subtitle={undefined} 
          progress={undefined} 
        />
      </div>

      <ClientBox title="Clients" clients={clients.client} />
    </div>
  )
}
