"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FolderKanban, Plus, Search, SlidersHorizontal } from "lucide-react";

import ProjectCard, { PROJECT_STATUS_CONFIG, ProjectStatus } from "./ProjectCard";

type Client = {
  id: string;
  name: string;
  initials: string;
};

type Project = {
  id: string;
  name: string;
  client: Client;
  status: ProjectStatus;
  progress: number;
  dueDate: string | null;
};

type ProjectsViewProps = {
  projects: Project[];
  workspaceSlug: string;
};

const STATUS_FILTERS: Array<{ value: "All" | ProjectStatus; label: string }> = [
  { value: "All", label: "All Statuses" },
  ...(Object.keys(PROJECT_STATUS_CONFIG) as ProjectStatus[]).map((status) => ({
    value: status,
    label: PROJECT_STATUS_CONFIG[status].label,
  })),
];

export default function ProjectsView({ projects, workspaceSlug }: ProjectsViewProps) {
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"All" | ProjectStatus>("All");

  const clients = useMemo(() => {
    const uniqueClients = new Map<string, Client>();

    projects.forEach((project) => {
      uniqueClients.set(project.client.id, project.client);
    });

    return Array.from(uniqueClients.values());
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.client.name.toLowerCase().includes(search.toLowerCase());

      const matchesClient =
        clientFilter === "All" || project.client.id === clientFilter;

      const matchesStatus =
        statusFilter === "All" || project.status === statusFilter;

      return matchesSearch && matchesClient && matchesStatus;
    });
  }, [projects, search, clientFilter, statusFilter]);

  return (
    <main className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every project across your workspace, in one place.
          </p>
        </div>

      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search projects or clients..."
          className="h-11 w-full rounded-lg border bg-background pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 rounded-lg p-1 items-center">

        {/* Client */}
        <div className="flex justify-between">
        <select
          value={clientFilter}
          onChange={(event) => setClientFilter(event.target.value)}
          className="h-10 rounded-lg border bg-background px-3 text-sm outline-none"
        >
          <option value="All">All Clients</option>

          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as "All" | ProjectStatus)
          }
          className="h-10 rounded-lg border bg-background px-3 text-sm outline-none"
        >
          {STATUS_FILTERS.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
        </div>

        <div className="md:ml-auto text-sm text-muted-foreground">
          {filteredProjects.length}{" "}
          {filteredProjects.length === 1 ? "project" : "projects"}
        </div>
      </div>

      {/* Project Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} workspaceSlug={workspaceSlug} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
          <FolderKanban className="h-8 w-8 text-muted-foreground" />
          <h2 className="mt-3 text-lg font-semibold">No projects yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Create your first project to start tracking progress across clients.
          </p>
          <Link
            href={`/${workspaceSlug}/projects/new`}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        </div>
      ) : (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
          <h2 className="text-lg font-semibold">No projects found</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Try changing your search or filters.
          </p>
        </div>
      )}
    </main>
  );
}
