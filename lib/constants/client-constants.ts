export const CLIENT_STATUSES = [
  "LEAD",
  "ACTIVE",
  "INACTIVE",
  "ARCHIVED",
] as const;

export type ClientStatus = (typeof CLIENT_STATUSES)[number];
