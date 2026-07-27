import ClientHeader from "@/components/client/ClientHeader"
import Nav from "@/components/client/Nav"
import ClientContent from "@/components/client/ClientContent"
import ClientContactInfo from "@/components/client/ClientContactInfo"
import { ClientNavProvider } from "@/components/client/ClientNavContext"
import { GetClientDetails } from "@/lib/actions/client"

export default async function Page({ params }) {
  const { workspace, client } = await params
  
  const Client = await GetClientDetails(client)
  /*const client = {
    id: clientId,
    workspaceId: workspace,
    name: "Client Name",
    companyName: "Nexuforge inc.",
    email: "hello@nexuforge.com",
    phone: "+1 555 123 4567",
    website: "https://nexuforge.com",
    industry: "Manufacturing",
    logo: "",
    address: "123 Main St, Springfield",
    notes: "",
    status: "LEAD" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  }*/

  return (
    <ClientNavProvider>
      <div className="p-1 flex flex-col gap-2">
        <div className="p-2 flex flex-col gap-2 justify-items-start ">
          <ClientHeader logo={Client.logo} name={Client.name} companyName={Client.companyName} />
          <div className="flex gap-2 items-center">
            {
              Client.status === "ACTIVE" ?
              <span className="h-4 w-4 bg-green-500 rounded-full"></span> : <span className="h-8 w-8 bg-red-500 rounded-full"></span>
            }
            <p>{Client.status}</p>
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
