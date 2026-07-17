"use client"

import { useMemo, useState } from "react"
import ClientCard from "@/components/dashboard/ClientCard"
import { CLIENT_STATUSES } from "@/lib/constants/client-constants"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Client = {
  id: string
  name: string
  companyName?: string | null
  email?: string | null
  status?: string | null
  [key: string]: unknown
}

interface ClientsFilterProps {
  clients: Client[]
}

const ALL_STATUSES = "ALL"

export default function ClientsFilter({ clients }: ClientsFilterProps) {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string>(ALL_STATUSES)

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase()

    return clients.filter((client) => {
      const matchesStatus = status === ALL_STATUSES || client.status === status

      if (!matchesStatus) return false
      if (!query) return true

      const name = client.name?.toLowerCase() ?? ""
      const companyName = client.companyName?.toLowerCase() ?? ""
      const email = client.email?.toLowerCase() ?? ""

      return (
        name.includes(query) ||
        companyName.includes(query) ||
        email.includes(query)
      )
    })
  }, [clients, search, status])

  return (
    <div>
      <header className="sticky top-0 flex gap-2">
        <Input
          type="search"
          placeholder="Search by name, company, or email"
          className="w-[70%]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[30%]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              <SelectItem value={ALL_STATUSES}>All</SelectItem>
              {CLIENT_STATUSES.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </header>
      <div>
        {filteredClients.length === 0 ? (
          <p className="text-sm text-muted-foreground mt-4">
            No clients match your search.
          </p>
        ) : (
          filteredClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))
        )}
      </div>
    </div>
  )
}
