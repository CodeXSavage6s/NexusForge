import React from "react";
import { GetProjectsForClient, ProjectsClientCount } from "@/lib/actions/project";
import { GetClientDetails } from "@/lib/actions/client";
import { getWorkspace } from "@/lib/actions/workspace";
import ProjectsList from "@/components/project/ProjectsList";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation"

type Props = {
  params: Promise<{
    workspace: string;
    client: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { workspace, client } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  const ws = await getWorkspace(workspace, userId);

  if (!ws) notFound();
  
  const clientDetails = await GetClientDetails(client, ws.id)

  if (!clientDetails) notFound();
  
  const projectsRes = await GetProjectsForClient(client);
  const count = await ProjectsClientCount(client);

  const projects = projectsRes.success ? projectsRes.projects : [];

  return (
    <div className="p-1">
      <h1 className="text-2xl font-bold mb-2">{clientDetails?.name ?? "Client"}</h1>
      <ProjectsList projects={projects ?? []} workspace={workspace} client={client} />
    </div>
  );
}
