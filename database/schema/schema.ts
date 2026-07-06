import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  integer,
  real,
  numeric,
  boolean,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

/**
 * NOTE ON USER REFERENCES
 * ------------------------
 * Better Auth owns the `user` table (id: text, cuid2-style). We don't
 * redefine it here — import it from wherever your auth schema lives and
 * point the .references() calls at it, e.g.:
 *
 *   import { user } from "./auth-schema";
 *   ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" })
 *
 * Below, ownerId / userId / authorId / etc. are left as plain text columns
 * with a TODO so this file has zero import-order dependency on your auth
 * setup. Wire up the .references() once you confirm the table/export name.
 */

const cuid = () => text("id").primaryKey().$defaultFn(() => createId());

// ─────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────

export const clientStatusEnum = pgEnum("client_status", [
  "ACTIVE",
  "INACTIVE",
  "LEAD",
  "ARCHIVED",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "PLANNING",
  "ACTIVE",
  "REVIEW",
  "COMPLETED",
  "ON_HOLD",
  "CANCELLED",
]);

export const priorityEnum = pgEnum("priority", ["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const taskStatusEnum = pgEnum("task_status", [
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "DONE",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "INFO",
  "SUCCESS",
  "WARNING",
  "ERROR",
  "MENTION",
]);

// ── V2+ only enums ──
export const projectMemberRoleEnum = pgEnum("project_member_role", [
  "OWNER",
  "ADMIN",
  "MEMBER",
  "VIEWER",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "DRAFT",
  "SENT",
  "PAID",
  "OVERDUE",
]);

// ═════════════════════════════════════════════════════════════
// V1 CORE
// ═════════════════════════════════════════════════════════════

// ── Client ──────────────────────────────────────────────────
export const clients = pgTable(
  "clients",
  {
    id: cuid(),
    ownerId: text("owner_id").notNull(), // TODO: .references(() => user.id)
    name: text("name").notNull(),
    companyName: text("company_name"),
    email: text("email"),
    phone: text("phone"),
    website: text("website"),
    industry: text("industry"),
    logo: text("logo"),
    address: text("address"),
    notes: text("notes"),
    status: clientStatusEnum("status").notNull().default("LEAD"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    ownerIdx: index("clients_owner_idx").on(t.ownerId),
    statusIdx: index("clients_status_idx").on(t.status),
  })
);

// ── Project ─────────────────────────────────────────────────
export const projects = pgTable(
  "projects",
  {
    id: cuid(),
    clientId: text("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    ownerId: text("owner_id").notNull(), // TODO: .references(() => user.id)
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    status: projectStatusEnum("status").notNull().default("PLANNING"),
    priority: priorityEnum("priority").notNull().default("MEDIUM"),
    budget: numeric("budget", { precision: 12, scale: 2 }),
    currency: text("currency").notNull().default("USD"),
    startDate: timestamp("start_date"),
    dueDate: timestamp("due_date"),
    completedAt: timestamp("completed_at"),
    progress: integer("progress").notNull().default(0), // 0-100
    color: text("color"),
    icon: text("icon"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    // slug unique per owner, not globally — adjust if you want it scoped to client instead
    ownerSlugUnique: uniqueIndex("projects_owner_slug_unique").on(t.ownerId, t.slug),
    clientIdx: index("projects_client_idx").on(t.clientId),
    statusIdx: index("projects_status_idx").on(t.status),
  })
);

// ── Task ────────────────────────────────────────────────────
export const tasks = pgTable(
  "tasks",
  {
    id: cuid(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    status: taskStatusEnum("status").notNull().default("TODO"),
    priority: priorityEnum("priority").notNull().default("MEDIUM"),
    dueDate: timestamp("due_date"),
    assignedTo: text("assigned_to"), // TODO: .references(() => user.id)
    position: real("position").notNull().default(0), // float for cheap drag-reorder
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    projectIdx: index("tasks_project_idx").on(t.projectId),
    statusIdx: index("tasks_status_idx").on(t.status),
    assigneeIdx: index("tasks_assignee_idx").on(t.assignedTo),
  })
);

// ── Document ────────────────────────────────────────────────
export const documents = pgTable(
  "documents",
  {
    id: cuid(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content").notNull().default(""),
    createdBy: text("created_by").notNull(), // TODO: .references(() => user.id)
    lastEditedBy: text("last_edited_by"), // TODO: .references(() => user.id)
    isArchived: boolean("is_archived").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    projectIdx: index("documents_project_idx").on(t.projectId),
  })
);

// ── Comment ─────────────────────────────────────────────────
// Kept polymorphic (entityType/entityId) instead of documentId-only,
// so it's ready for task comments etc. without a schema change.
export const commentEntityTypeEnum = pgEnum("comment_entity_type", [
  "DOCUMENT",
  "TASK",
]);

export const comments = pgTable(
  "comments",
  {
    id: cuid(),
    entityType: commentEntityTypeEnum("entity_type").notNull().default("DOCUMENT"),
    entityId: text("entity_id").notNull(), // documents.id or tasks.id depending on entityType
    authorId: text("author_id").notNull(), // TODO: .references(() => user.id)
    content: text("content").notNull(),
    parentCommentId: text("parent_comment_id"),
    resolved: boolean("resolved").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    entityIdx: index("comments_entity_idx").on(t.entityType, t.entityId),
    parentIdx: index("comments_parent_idx").on(t.parentCommentId),
  })
);

// ── Activity ────────────────────────────────────────────────
export const activity = pgTable(
  "activity",
  {
    id: cuid(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(), // TODO: .references(() => user.id)
    type: text("type").notNull(), // e.g. "project.created", "task.completed"
    message: text("message").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    projectIdx: index("activity_project_idx").on(t.projectId),
    createdAtIdx: index("activity_created_at_idx").on(t.createdAt),
  })
);

// ── Notification ────────────────────────────────────────────
export const notifications = pgTable(
  "notifications",
  {
    id: cuid(),
    recipientId: text("recipient_id").notNull(), // TODO: .references(() => user.id)
    title: text("title").notNull(),
    body: text("body").notNull(),
    type: notificationTypeEnum("type").notNull().default("INFO"),
    isRead: boolean("is_read").notNull().default(false),
    actionUrl: text("action_url"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    recipientIdx: index("notifications_recipient_idx").on(t.recipientId),
    unreadIdx: index("notifications_unread_idx").on(t.recipientId, t.isRead),
  })
);

// ═════════════════════════════════════════════════════════════
// V2+ (uncomment / include in migrations when you're ready)
// ═════════════════════════════════════════════════════════════

// ── ProjectMember (team collaboration) ─────────────────────
export const projectMembers = pgTable(
  "project_members",
  {
    id: cuid(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(), // TODO: .references(() => user.id)
    role: projectMemberRoleEnum("role").notNull().default("MEMBER"),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
  },
  (t) => ({
    projectUserUnique: uniqueIndex("project_members_project_user_unique").on(
      t.projectId,
      t.userId
    ),
  })
);

// ── File (file management) ─────────────────────────────────
export const files = pgTable(
  "files",
  {
    id: cuid(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    uploadedBy: text("uploaded_by").notNull(), // TODO: .references(() => user.id)
    name: text("name").notNull(),
    url: text("url").notNull(),
    size: integer("size").notNull(), // bytes
    mimeType: text("mime_type").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    projectIdx: index("files_project_idx").on(t.projectId),
  })
);

// ── TimeEntry (time tracking) ───────────────────────────────
export const timeEntries = pgTable(
  "time_entries",
  {
    id: cuid(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(), // TODO: .references(() => user.id)
    description: text("description"),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time"),
    duration: integer("duration"), // seconds; compute on stop, don't trust client clock
  },
  (t) => ({
    projectIdx: index("time_entries_project_idx").on(t.projectId),
    userIdx: index("time_entries_user_idx").on(t.userId),
  })
);

// ── Invoice ─────────────────────────────────────────────────
export const invoices = pgTable(
  "invoices",
  {
    id: cuid(),
    clientId: text("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    projectId: text("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    invoiceNumber: text("invoice_number").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("USD"),
    status: invoiceStatusEnum("status").notNull().default("DRAFT"),
    issueDate: timestamp("issue_date").notNull().defaultNow(),
    dueDate: timestamp("due_date").notNull(),
  },
  (t) => ({
    invoiceNumberUnique: uniqueIndex("invoices_invoice_number_unique").on(
      t.invoiceNumber
    ),
    clientIdx: index("invoices_client_idx").on(t.clientId),
  })
);

// ═════════════════════════════════════════════════════════════
// RELATIONS
// ═════════════════════════════════════════════════════════════

export const clientsRelations = relations(clients, ({ many }) => ({
  projects: many(projects),
  invoices: many(invoices),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, { fields: [projects.clientId], references: [clients.id] }),
  tasks: many(tasks),
  documents: many(documents),
  activity: many(activity),
  members: many(projectMembers),
  files: many(files),
  timeEntries: many(timeEntries),
  invoices: many(invoices),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  comments: many(comments),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  project: one(projects, { fields: [documents.projectId], references: [projects.id] }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  parent: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
    relationName: "comment_replies",
  }),
  replies: many(comments, { relationName: "comment_replies" }),
}));

export const activityRelations = relations(activity, ({ one }) => ({
  project: one(projects, { fields: [activity.projectId], references: [projects.id] }),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
}));

export const filesRelations = relations(files, ({ one }) => ({
  project: one(projects, { fields: [files.projectId], references: [projects.id] }),
}));

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  project: one(projects, { fields: [timeEntries.projectId], references: [projects.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  client: one(clients, { fields: [invoices.clientId], references: [clients.id] }),
  project: one(projects, { fields: [invoices.projectId], references: [projects.id] }),
}));
