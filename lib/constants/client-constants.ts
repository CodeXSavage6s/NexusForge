export const CLIENT_STATUSES = [
  "LEAD",
  "ACTIVE",
  "INACTIVE",
  "ARCHIVED",
] as const;

export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export type PROJECT_STATUS = "PLANNING" | "ACTIVE" | "REVIEW"| "COMPLETED" | "ON_HOLD" | "CANCELLED"

export type PROJECT_PRIORITY = "LOW" | "MEDIUM" | "HIGH" | "URGENT"
