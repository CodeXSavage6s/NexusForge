import Image from 'next/image'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import ClientDropMenu from "@/components/client/ClientDropMenu"

interface ClientHeaderProps {
  name: string
  logo?: string | null | undefined
  companyName?: string | null
  workspace: string
  client: string
}

export default function ClientHeader({ name, logo, companyName, workspace, client }: ClientHeaderProps) {
  return (
    <div className="flex flex-row justify-between gap-12 p-2">
      <div className="flex gap-2">
        <Avatar className="w-12 h-12">
          <AvatarImage src={logo || undefined} alt="client logo" />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-bold">{name}</h3>
          <span className="text-gray-400">{companyName}</span>
        </div>
      </div>
      <ClientDropMenu className="self-end" workspaceId={workspace} clientId={client} clientName={name}/>
    </div>
  )
}