import Greetings from '@/components/dashboard/Greetings'
import InfoCard from '@/components/dashboard/InfoCard'
import ClientCard from '@/components/dashboard/ClientCard'
import { demoInfoCards, demoClients } from '@/lib/constants/dashboard-constants'
import {auth} from "@/lib/better-auth/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import { ProjectsCount } from "@/lib/actions/project"
import { ClientCount } from "@/lib/actions/client"


export default async function Dashboard() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  const user = session?.user
  const projectCount = await ProjectsCount()
  const clientCount = await ClientCount()
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
