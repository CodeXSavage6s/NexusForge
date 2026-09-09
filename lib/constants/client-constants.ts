export const CLIENT_STATUSES = [
  "LEAD",
  "ACTIVE",
  "INACTIVE",
  "ARCHIVED",
] as const;

export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export type PROJECT_STATUS = "PLANNING" | "ACTIVE" | "REVIEW"| "COMPLETED" | "ON_HOLD" | "CANCELLED"

export type PROJECT_PRIORITY = "LOW" | "MEDIUM" | "HIGH" | "URGENT"

export const PROJECT_STATUS_OPTIONS: { value: PROJECT_STATUS; label: string; dot: string }[] = [
  { value: "PLANNING", label: "Planning", dot: "bg-gray-400" },
  { value: "ACTIVE", label: "Active", dot: "bg-green-500" },
  { value: "REVIEW", label: "In Review", dot: "bg-yellow-400" },
  { value: "ON_HOLD", label: "On Hold", dot: "bg-orange-400" },
  { value: "COMPLETED", label: "Completed", dot: "bg-blue-500" },
  { value: "CANCELLED", label: "Cancelled", dot: "bg-red-500" },
];

export const PROJECT_PRIORITY_STYLES: Record<PROJECT_PRIORITY, string> = {
  LOW: "bg-muted text-muted-foreground border border-border",
  MEDIUM: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
  HIGH: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
  URGENT: "bg-destructive/10 text-destructive border border-destructive/20",
};