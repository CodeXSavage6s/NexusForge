import ProjectsView from "@/components/project/ProjectsView";
import { GetWorkspaceProjects } from "@/lib/actions/project";
import db from "@/database/index";
import { workspaces } from "@/database/schema/schema";
import { eq } from "drizzle-orm";

type Props = {
  params: Promise<{ workspace: string }>;
};

export default async function ProjectsPage({ params }: Props) {
  const { workspace: workspaceSlug } = await params;

  const [workspace] = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.slug, workspaceSlug))
    .limit(1);

  if (!workspace) {
    return <ProjectsView projects={[]} workspaceSlug={workspaceSlug} />;
  }

  const result = await GetWorkspaceProjects(workspace.id);

  return (
    <ProjectsView
      projects={result.success ? result.projects : []}
      workspaceSlug={workspaceSlug}
    />
  );
}
