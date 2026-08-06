export type ClientStatus = "LEAD" | "ACTIVE" | "INACTIVE" | "ARCHIVED"

export interface Client {
  id: string
  workspaceId: string
  name: string
  companyName: string | null
  email: string | null
  phone: string | null
  website: string | null
  industry: string | null
  logo: string | null
  address: string | null
  notes: string | null
  status: ClientStatus
  createdAt: Date
  updatedAt: Date
}

export interface ActivityItem {
  id: string
  clientId: string
  projectId: string
  userId: string
  type: string
  message: string
  metadata: unknown
  createdAt: Date
}

export type Activities = {
  success: boolean
  activities?: ActivityItem[]
  error?: string
}

