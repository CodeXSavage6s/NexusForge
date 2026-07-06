import Greetings from '@/components/dashboard/Greetings'
import InfoCard from '@/components/dashboard/InfoCard'
import ClientCard from '@/components/dashboard/ClientCard'
import { demoInfoCards, demoClients } from '@/lib/constants/dashboard-constants'
import {auth} from "@/lib/better-auth/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";


export default async function Dashboard() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  const user = session?.user
  return (
    <div className="flex flex-col gap-2 p-2">
      <Greetings user={user.name} projectCount={15} clientCount={8} />

      <section className="grid grid-cols-2 mid:grid-cols-4 gap-2">
        {demoInfoCards.map((card) => (
          <InfoCard key={card.title} {...card} />
        ))}
      </section>

      <ClientCard title="Clients" clients={demoClients} />
    </div>
  )
}
