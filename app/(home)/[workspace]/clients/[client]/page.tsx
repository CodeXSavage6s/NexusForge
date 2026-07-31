import ClientHeader from "@/components/client/ClientHeader"
import Nav from "@/components/client/Nav"
import ClientContent from "@/components/client/ClientContent"
import ClientContactInfo from "@/components/client/ClientContactInfo"
import { ClientNavProvider } from "@/components/client/ClientNavContext"
import { getWorkspace } from "@/lib/actions/workspace"
import { GetClientDetails } from "@/lib/actions/client"
import { auth } from "@/lib/better-auth/auth"
import { headers } from "next/headers"

export default async function Page({ params }: { params: { workspace: string; client: string } }) {
  const { workspace, client } = await params
  
  const session = await auth.api.getSession({ headers: await headers() });

  const user = session?.user

  const Workspace = await getWorkspace(workspace, user?.id)

  const Client = await GetClientDetails(client, Workspace?.id)
  console.log("Client from page.tsx", Client)

  return (
    <ClientNavProvider>
      <div className="p-1 flex flex-col gap-2">
        <div className="p-2 flex flex-col gap-2 justify-items-start ">
          <ClientHeader logo={Client?.logo} name={Client?.name} companyName={Client?.companyName} />
          <div className="flex gap-2 items-center">
            {
              Client?.status === "ACTIVE" ?
              <span className="h-4 w-4 bg-green-500 rounded-full"></span> : <span className="h-8 w-8 bg-red-500 rounded-full"></span>
            }
            <p>{Client?.status}</p>
          </div>
          <div className="flex justify-evenly gap-2 ">
            <span>{0} Projects</span>•<span>{0} Unpaid invoice</span>
          </div>
          <Nav className="self-start"/>
        </div>

        <ClientContent client={Client} />

        <ClientContactInfo client={Client} />
      </div>
    </ClientNavProvider>
  )
}
