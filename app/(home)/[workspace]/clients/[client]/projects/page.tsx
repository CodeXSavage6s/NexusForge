import React from "react";
import Link from "next/link";
import { GetProjectsForClient, ProjectsClientCount } from "@/lib/actions/project";
import DeleteBtn from "@/components/project/DeleteBtn";

type Props = {
  params: Promise<{
    workspace: string;
    client: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { workspace, client } = await params;

  const projectsRes = await GetProjectsForClient(client);
  const count = await ProjectsClientCount(client);

  console.log("Projects from page.tsx", projectsRes);

  const projects = projectsRes.success ? projectsRes.projects : [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Projects</h1>
      <p className="text-sm text-muted-foreground mb-4">Total projects: {projects?.length} (counted: {count})</p>
      <p className="text-sm text-muted-foreground mb-6">Documents: 0</p>

      <div className="space-y-4">
        {projects?.length === 0 ? (
          <p className="text-sm text-muted-foreground">No projects yet.</p>
        ) : (
          projects?.map((p: any) => (
            <div key={p.id} className="flex flex-row justify-between items-center gap-4 p-4 border rounded-md">
                <div className="">
                    <Link
                        href={`/${workspace}/clients/${client}/projects/${p.id}`}
                        className="text-lg font-semibold"
                    >
                        {p.name}
                    </Link>
                    {p.description && <p className="text-sm text-muted-foreground">{p.description}</p>}
                </div>
                <DeleteBtn projectId={p.id} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
