"use client";

import { Briefcase, Users, FolderOpen } from "lucide-react";

interface ProfileStatsProps {
  workspaceCount: number;
  clientCount: number;
  projectCount: number;
}

export default function ProfileStats({
  workspaceCount,
  clientCount,
  projectCount,
}: ProfileStatsProps) {
  const stats = [
    {
      label: "Workspaces",
      value: workspaceCount,
      icon: Briefcase,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      label: "Clients",
      value: clientCount,
      icon: Users,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
    },
    {
      label: "Projects",
      value: projectCount,
      icon: FolderOpen,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="flex flex-col items-center gap-3 mb-2">
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                {stat.label}
              </p>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
}
