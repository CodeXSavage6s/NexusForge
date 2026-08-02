import ClientHeader from "@/components/client/ClientHeader"
import Nav from "@/components/client/Nav"
import ClientContent from "@/components/client/ClientContent"
import ClientContactInfo from "@/components/client/ClientContactInfo"
import { ClientNavProvider } from "@/components/client/ClientNavContext"
import { getWorkspace } from "@/lib/actions/workspace"
import { GetClientDetails } from "@/lib/actions/client"
import { auth } from "@/lib/better-auth/auth"
import { headers } from "next/headers"
import { GetClientActivities } from "@/lib/actions/activity"
import { ProjectsClientCount } from "@/lib/actions/project"

export default async function Page({ params }: { params: { workspace: string; client: string } }) {
  const { workspace, client } = await params
  
  const session = await auth.api.getSession({ headers: await headers() });

  const user = session?.user

  const Workspace = await getWorkspace(workspace, user?.id)

  const activities = await GetClientActivities(client)

  console.log("Activities from page.tsx", activities)

  const projectCount = await ProjectsClientCount(client)

  const clientData = await GetClientDetails(client, Workspace?.id)
  console.log("Client from page.tsx", clientData)

  const STATUS_OPTIONS: ({
    value: "ACTIVE";
    label: string;
    dot: string;
  } | {
    value: "INACTIVE";
    label: string;
    dot: string;
  } | {
    value: "LEAD";
    label: string;
    dot: string;
  } | {
    value: "ARCHIVED";
    label: string;
    dot: string;
  })[] = [
    { value: "ACTIVE", label: "Active", dot: "bg-green-500" },
    { value: "INACTIVE", label: "Inactive", dot: "bg-gray-400" },
    { value: "LEAD", label: "Lead", dot: "bg-yellow-400" },
    { value: "ARCHIVED", label: "Archived", dot: "bg-red-500" },
  ]

  const statusOption = STATUS_OPTIONS.find(s => s.value === clientData?.status)

  return (
    <ClientNavProvider>
      <div className="p-1 flex flex-col gap-2">
        <div className="p-2 flex flex-col gap-2 justify-items-start ">
          <ClientHeader logo={clientData?.logo} name={clientData?.name} companyName={clientData?.companyName} workspace={Workspace.id} client={client} />
          <div className="flex gap-2 items-center">
            <span className={`h-4 w-4 ${statusOption?.dot ?? 'bg-gray-400'} rounded-full`}></span>
            <p>{statusOption?.label ?? clientData?.status}</p>
          </div>
          <div className="flex gap-2 ">
            <span>{projectCount} Projects</span>•<span>{0} Unpaid invoice</span>
          </div>
          <Nav className="self-start"/>
        </div>

        <ClientContent client={clientData} activities={activities.activities} />

        <ClientContactInfo client={clientData} />
      </div>
    </ClientNavProvider>
  )
}
