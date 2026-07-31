// Generated types for database schema

export type ClientStatus = "ACTIVE" | "INACTIVE" | "LEAD" | "ARCHIVED"

export type ProjectStatus =
  | "PLANNING"
  | "ACTIVE"
  | "REVIEW"
  | "COMPLETED"
  | "ON_HOLD"
  | "CANCELLED"

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"

export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE"

export type NotificationType = "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "MENTION"

export type ProjectMemberRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER"

export type WorkspaceMemberRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER"

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE"

export interface Workspace {
  id: string
  ownerId: string
  name: string
  slug: string
  logo?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface WorkspaceMember {
  id: string
  workspaceId: string
  userId: string
  role: WorkspaceMemberRole
  joinedAt: Date
}

export interface Project {
  id: string
  clientId: string
  workspaceId: string
  name: string
  slug: string
  description?: string | null
  status: ProjectStatus
  priority: Priority
  budget?: number | null
  currency: string
  startDate?: Date | null
  dueDate?: Date | null
  completedAt?: Date | null
  progress: number
  color?: string | null
  icon?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  projectId: string
  title: string
  description?: string | null
  status: TaskStatus
  priority: Priority
  dueDate?: Date | null
  assignedTo?: string | null
  position: number
  createdAt: Date
  updatedAt: Date
}

export interface Document {
  id: string
  projectId: string
  title: string
  content: string
  createdBy: string
  lastEditedBy?: string | null
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
}

export type CommentEntityType = "DOCUMENT" | "TASK"

export interface Comment {
  id: string
  entityType: CommentEntityType
  entityId: string
  authorId: string
  content: string
  parentCommentId?: string | null
  resolved: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Activity {
  id: string
  clientId: string
  projectId: string
  userId: string
  type: string
  message: string
  metadata?: unknown
  createdAt: Date
}

export interface ProjectMember {
  id: string
  projectId: string
  userId: string
  role: ProjectMemberRole
  joinedAt: Date
}

export interface FileRecord {
  id: string
  projectId: string
  uploadedBy: string
  name: string
  url: string
  size: number
  mimeType: string
  createdAt: Date
}

export interface TimeEntry {
  id: string
  projectId: string
  userId: string
  description?: string | null
  startTime: Date
  endTime?: Date | null
  duration?: number | null
}

export interface Invoice {
  id: string
  clientId: string
  projectId?: string | null
  invoiceNumber: string
  amount: number
  currency: string
  status: InvoiceStatus
  issueDate: Date
  dueDate: Date
}

export interface Notification {
  id: string
  recipientId: string
  title: string
  body: string
  type: NotificationType
  isRead: boolean
  actionUrl?: string | null
  createdAt: Date
}
