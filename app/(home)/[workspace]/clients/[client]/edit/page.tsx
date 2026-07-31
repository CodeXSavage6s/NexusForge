import MarkdownEditor from "@/components/client/MarkdownEditor"
import ClientInfoEdit from "@/components/client/ClientInfoEdit"
import ClientContactEdit from "@/components/client/ClientContactEdit"
import { GetClientDetails } from "@/lib/actions/client"
import { getWorkspace } from "@/lib/actions/workspace"
import { auth } from "@/lib/better-auth/auth"
import { headers } from "next/headers"


export default async function page({ params }: { params: { workspace: string; client: string } }) {
  const { workspace, client } = await params
    
    const session = await auth.api.getSession({ headers: await headers() });
  
    const user = session?.user
  
    const Workspace = await getWorkspace(workspace, user?.id)
  
    const Client = await GetClientDetails(client, Workspace?.id)
    console.log("Client from page.tsx", Client)
  
  return (
    <div className="flex flex-col gap-3">
        <ClientInfoEdit client={Client}/>
        <MarkdownEditor initialValue={Client}/>
        <ClientContactEdit client={Client}/>
    </div>
  )
}