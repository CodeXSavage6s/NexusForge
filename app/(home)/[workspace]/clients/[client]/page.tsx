import ClientHeader from "@/components/client/ClientHeader"
import TabNavigator from "@/components/client/Nav"

export default async function page({ params }) {
  const { workspace, client } = await params
  
  return (
    <div className="p-1">
      <div className="bg-card rounded">
        <ClientHeader logo="" name="Client Name" companyName="Nexuforge inc."/>
        <TabNavigator />
      </div>
    </div>
  )
}