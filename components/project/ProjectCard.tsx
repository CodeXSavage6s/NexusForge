import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";

export type ProjectStatus =
  | "PLANNING"
  | "ACTIVE"
  | "REVIEW"
  | "COMPLETED"
  | "ON_HOLD"
  | "CANCELLED";

type ProjectCardProps = {
  project: {
    id: string;
    name: string;
    client: {
      id: string;
      name: string;
      initials: string;
    };
    status: ProjectStatus;
    progress: number;
    dueDate: string | null;
  };
  workspaceSlug: string;
};

export const PROJECT_STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; badge: string; accent: string }
> = {
  PLANNING: {
    label: "Planning",
    badge: "bg-muted text-muted-foreground",
    accent: "bg-muted-foreground/40",
  },
  ACTIVE: {
    label: "Active",
    badge: "bg-blue-500/10 text-blue-500",
    accent: "bg-blue-500",
  },
  REVIEW: {
    label: "In Review",
    badge: "bg-purple-500/10 text-purple-500",
    accent: "bg-purple-500",
  },
  ON_HOLD: {
    label: "On Hold",
    badge: "bg-yellow-500/10 text-yellow-600",
    accent: "bg-yellow-500",
  },
  COMPLETED: {
    label: "Completed",
    badge: "bg-green-500/10 text-green-600",
    accent: "bg-green-500",
  },
  CANCELLED: {
    label: "Cancelled",
    badge: "bg-red-500/10 text-red-500",
    accent: "bg-red-500",
  },
};

// Same red/yellow/green convention used on the project detail page,
// so progress reads consistently across the app.
function progressBarColor(progress: number) {
  if (progress < 20) return "bg-red-500";
  if (progress < 50) return "bg-yellow-500";
  return "bg-green-500";
}

const AVATAR_PALETTE = [
  "bg-primary/10 text-primary",
  "bg-pink-500/10 text-pink-600",
  "bg-indigo-500/10 text-indigo-600",
  "bg-orange-500/10 text-orange-600",
  "bg-teal-500/10 text-teal-600",
];

function avatarColor(seed: string) {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

function formatDueDate(dueDate: string | null) {
  if (!dueDate) return "No due date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dueDate));
}

function isOverdue(dueDate: string | null, status: ProjectStatus) {
  if (!dueDate) return false;
  if (status === "COMPLETED" || status === "CANCELLED") return false;
  return new Date(dueDate).getTime() < Date.now();
}

export default function ProjectCard({ project, workspaceSlug }: ProjectCardProps) {
  const statusConfig =
    PROJECT_STATUS_CONFIG[project.status] ?? PROJECT_STATUS_CONFIG.PLANNING;
  const overdue = isOverdue(project.dueDate, project.status);

  return (
    <Link
      href={`/${workspaceSlug}/clients/${project.client.id}/projects/${project.id}`}
      className="group relative block overflow-hidden rounded-xl border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Status accent */}
      <div
        className={`absolute inset-y-0 left-0 w-1 ${statusConfig.accent}`}
      />

      {/* Top */}
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="min-w-0">
          <h2 className="truncate font-semibold">{project.name}</h2>

          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarColor(
                project.client.id
              )}`}
            >
              {project.client.initials}
            </div>

            <span className="truncate text-sm text-muted-foreground">
              {project.client.name}
            </span>
          </div>
        </div>

        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
      </div>

      
      {/* Progress */}
      <div className="">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{project.progress}%</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${progressBarColor(
              project.progress
            )}`}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <div className=" ">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.badge}`}
        >
          {statusConfig.label}
        </span>
      </div>
      <div
        className={` flex items-center gap-2 border-t pt-4 pl-2 text-xs ${
          overdue ? "text-red-500" : "text-muted-foreground"
        }`}
      >
        <CalendarDays className="h-3.5 w-3.5" />
        {overdue ? "Overdue" : "Due"} {formatDueDate(project.dueDate)}
      </div>
      </div>
    </Link>
  );
}
