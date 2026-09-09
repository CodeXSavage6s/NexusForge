import ClientHeader from "@/components/client/ClientHeader"
import Nav from "@/components/client/Nav"
import ClientContent from "@/components/client/ClientContent"
import ClientContactInfo from "@/components/client/ClientContactInfo"
import { ClientNavProvider } from "@/components/client/ClientNavContext"
import { getWorkspace } from "@/lib/actions/workspace"
import { GetClientDetails } from "@/lib/actions/client"
import { auth } from "@/lib/better-auth/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { GetClientActivities } from "@/lib/actions/activity"
import { ProjectsClientCount } from "@/lib/actions/project"
import { GetClientInvoiceSummary } from "@/lib/actions/invoice"
import { CLIENT_STATUSES } from "@/lib/constants/client-constants"

const STATUS_OPTIONS: { value: (typeof CLIENT_STATUSES)[number]; label: string; dot: string }[] = [
  { value: "ACTIVE", label: "Active", dot: "bg-green-500" },
  { value: "INACTIVE", label: "Inactive", dot: "bg-gray-400" },
  { value: "LEAD", label: "Lead", dot: "bg-yellow-400" },
  { value: "ARCHIVED", label: "Archived", dot: "bg-red-500" },
]

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

export default async function Page({ params }: { params: Promise<{ workspace: string; client: string }> }) {
  const { workspace, client } = await params

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");
  const user = session.user

  const Workspace = await getWorkspace(workspace, user?.id)
  if (!Workspace) throw new Error("Workspace not found")

  const [activities, projectCount, clientData, invoiceSummary] = await Promise.all([
    GetClientActivities(client),
    ProjectsClientCount(client),
    GetClientDetails(client, Workspace.id),
    GetClientInvoiceSummary(Workspace.id, client),
  ])

  const statusOption = STATUS_OPTIONS.find(s => s.value === clientData?.status)

  return (
    <ClientNavProvider>
      <div className="p-1 flex flex-col gap-2">
        <div className="p-2 flex flex-col gap-2 justify-items-start ">
          <ClientHeader logo={clientData?.logo} name={clientData?.name} companyName={clientData?.companyName} workspace={Workspace?.id} client={client} />
          <div className="flex gap-2 items-center">
            <span className={`h-4 w-4 ${statusOption?.dot ?? 'bg-gray-400'} rounded-full`}></span>
            <p>{statusOption?.label ?? clientData?.status}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span>{projectCount} Projects</span>
            <span>•</span>
            <span>
              {invoiceSummary.unpaidCount} Unpaid invoice{invoiceSummary.unpaidCount === 1 ? "" : "s"}
            </span>
            {invoiceSummary.outstandingAmount > 0 ? (
              <span className="text-muted-foreground">
                ({formatMoney(invoiceSummary.outstandingAmount, invoiceSummary.currency)} outstanding)
              </span>
            ) : null}
          </div>
          <Nav className="self-start"/>
        </div>

        <ClientContent client={clientData} activities={activities.activities} />

        <ClientContactInfo client={clientData} />
      </div>
    </ClientNavProvider>
  )
}
