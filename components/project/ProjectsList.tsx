"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import DeleteBtn from "@/components/project/DeleteBtn";
import type { Project, ProjectStatus, Priority } from "@/types/schema";

type Props = {
  projects: Project[];
  workspace: string;
  client: string;
};

const STATUS_OPTIONS: { value: ProjectStatus; label: string; dot: string }[] = [
  { value: "PLANNING", label: "Planning", dot: "bg-gray-400" },
  { value: "ACTIVE", label: "Active", dot: "bg-green-500" },
  { value: "REVIEW", label: "Review", dot: "bg-yellow-400" },
  { value: "COMPLETED", label: "Completed", dot: "bg-blue-500" },
  { value: "ON_HOLD", label: "On Hold", dot: "bg-orange-400" },
  { value: "CANCELLED", label: "Cancelled", dot: "bg-red-500" },
];

const PRIORITY_OPTIONS: { value: Priority; label: string; className: string }[] = [
  { value: "LOW", label: "Low", className: "bg-gray-100 text-gray-700" },
  { value: "MEDIUM", label: "Medium", className: "bg-blue-100 text-blue-700" },
  { value: "HIGH", label: "High", className: "bg-orange-100 text-orange-700" },
  { value: "URGENT", label: "Urgent", className: "bg-red-100 text-red-700" },
];

function statusMeta(status: ProjectStatus) {
  return STATUS_OPTIONS.find((s) => s.value === status);
}

function priorityMeta(priority: Priority) {
  return PRIORITY_OPTIONS.find((p) => p.value === priority);
}

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export default function ProjectsList({ projects, workspace, client }: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "ALL">("ALL");
  const [priority, setPriority] = useState<Priority | "ALL">("ALL");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (projects ?? []).filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q);
      const matchesStatus = status === "ALL" || p.status === status;
      const matchesPriority = priority === "ALL" || p.priority === priority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [projects, search, status, priority]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="flex-1 border rounded-md px-3 py-2 text-sm"
        />
        <div className="flex justify-between gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus | "ALL")}
            className="border rounded-md p-2 text-sm w-full"
          >
            <option value="ALL">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority | "ALL")}
            className="border rounded-md p-2 text-sm w-full"
          >
            <option value="ALL">All priorities</option>
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        Showing {filtered.length} of {projects?.length ?? 0} projects
      </p>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No projects match your search.</p>
        ) : (
          filtered.map((p) => {
            const sMeta = statusMeta(p.status);
            const pMeta = priorityMeta(p.priority);
            return (
              <Link
                href={`/${workspace}/clients/${client}/projects/${p.id}`}
                key={p.id}
                className="flex flex-row justify-between items-center gap-4 p-4 border rounded-md"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div
                      href={`/${workspace}/clients/${client}/projects/${p.id}`}
                      className="text-lg font-semibold"
                    >
                      {p.name}
                    </div>
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-transparent">
                      <span className={`h-2 w-2 rounded-full ${sMeta?.dot ?? "bg-gray-400"}`} />
                      {sMeta?.label ?? p.status}
                    </span>
                    {pMeta && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${pMeta.className}`}>
                        {pMeta.label}
                      </span>
                    )}
                  </div>

                  {p.description && (
                    <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                    <span>Progress: {p.progress ?? 0}%</span>
                    <span>
                      Due:{" "}
                      {p.dueDate
                        ? new Date(p.dueDate).toLocaleDateString("en-US", {
                            timeZone: "UTC",
                          })
                        : "No due date"}
                    </span>
                    {p.budget != null && (
                      <span>Budget: {formatCurrency(p.budget, p.currency)}</span>
                    )}
                  </div>
                </div>
                <DeleteBtn projectId={p.id} />
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
