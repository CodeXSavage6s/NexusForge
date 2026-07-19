import Image from 'next/image'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import ClientDropMenu from "@/components/client/ClientDropMenu"

export default function ClientHeader({ name, logo, companyName}) {
  return (
    <div className="flex flex-row justify-between gap-12 p-2">
      <div className="flex gap-2">
        <Avatar className="w-12 h-12">
          <AvatarImage src={logo} alt="client logo" />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-bold">{name}</h3>
          <span className="text-gray-400">{companyName}</span>
        </div>
      </div>
      <ClientDropMenu className="self-end"/>
    </div>
  )
}