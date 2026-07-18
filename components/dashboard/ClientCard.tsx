"use client"

import Link from "next/link";
import { Mail, Phone, FolderKanban } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from 'next/navigation'


export function ClientCard({
  workspace,
  client,
  projectCount = 0,
}: {
  client: ClientSummary;
  projectCount?: number;
}) {
  const path = usePathname()
  
  return (
    <Link
      href={`/${workspace}/clients/${client.id}`}
      className="flex justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
    >
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="font-semibold">{client.name}</h3>
          {client.companyName && (
            <p className="text-xs text-muted-foreground">{client.companyName}</p>
          )}
        </div>

        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          {client.email && (
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" /> {client.email}
            </span>
          )}
          {client.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" /> {client.phone}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <FolderKanban className="h-3.5 w-3.5" /> {projectCount} projects
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${client.status}`}
          >
            {client.status}
          </span>
        </div>
      </div>

      <Avatar className="w-12 h-12 shrink-0">
        <AvatarImage src={client.logo ?? undefined} />
        <AvatarFallback className="font-bold text-xl">
          {client.name[0]}
        </AvatarFallback>
      </Avatar>
    </Link>
  );
}

export default ClientCard;
