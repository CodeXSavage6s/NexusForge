import { Mail, Phone, Globe, MapPin } from "lucide-react"
import type { Client } from "./types"

function Row({
  icon: Icon,
  value,
  href,
}: {
  icon: typeof Mail
  value: string | null
  href?: string
}) {
  if (!value) return null

  const content = (
    <span className="flex items-center gap-2 text-sm">
      <Icon className="w-4 h-4 text-gray-400" />
      {value}
    </span>
  )

  return href ? (
    <a href={href} className="hover:underline">
      {content}
    </a>
  ) : (
    content
  )
}

export default function ClientContactInfo({ client }: { client: Client }) {
  return (
    <div className="grid gap-2  text-sm text-gray-400">
      <Row icon={Phone} value={client?.phone} href={client?.phone ? `tel:${client.phone}` : undefined} />
      <Row 
        icon={Globe} 
        value={client?.website} 
        href={client?.website ? (client?.website.startsWith('http') ? client?.website : `https://${client?.website}`) : undefined} 
      />
      <Row icon={MapPin} value={client?.address} />
      <Row icon={Mail} value={client?.email} href={client?.email ? `mailto:${client?.email}` : undefined} />
    </div>
  )
}
