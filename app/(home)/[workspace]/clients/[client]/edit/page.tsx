import MarkdownEditor from "@/components/client/MarkdownEditor"
import ClientInfoEdit from "@/components/client/ClientInfoEdit"
import ClientContactEdit from "@/components/client/ClientContactEdit"
import { GetClientDetails } from "@/lib/actions/client"

export default async function page({ params }) {
  const { workspace, client } = await params
  
  const Client = await GetClientDetails(client)
  return (
    <div className="flex flex-col gap-3">
        <ClientInfoEdit client={Client}/>
        <MarkdownEditor initialValue={Client}/>
        <ClientContactEdit client={Client}/>
    </div>
  )
}