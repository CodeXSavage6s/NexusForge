import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface Client {
  id: string;
  name: string;
  href: string;
  initials: string;
  projectCount: number;
}

export default function ClientCard({ title, clients = [] }: { title: string; clients?: Client[] }) {
  return (
    <div className="flex min-h-[200px] w-full flex-col gap-1 rounded-md bg-card p-2 shadow shadow-foreground-secondary">
      <p className="mb-1 text-xl font-bold">{title}</p>

      {clients.length === 0 ? (
        <p className="text-sm text-gray-400 px-1 py-4">No clients yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-foreground-secondary/10">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={client.href}
              className="flex items-center justify-between gap-3 rounded-sm px-1 py-2.5 transition-colors hover:bg-popover"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-700/20 text-sm font-semibold text-purple-400">
                  {client.initials}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{client.name}</span>
                  <span className="text-xs text-gray-400">
                    {client.projectCount} projects
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-500" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
