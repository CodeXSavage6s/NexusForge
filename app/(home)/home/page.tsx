import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getUserWorkspaces } from "@/lib/actions/workspace";
import { WorkspaceCard } from "@/components/workspace/WorkspaceCard";
import { CreateWorkspaceDialog } from "@/components/workspace/CreateWorkspaceDialog";

export default async function WorkspacesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const user = session.user;
  const workspaces = await getUserWorkspaces(user.id);

  return (
    <div className="flex flex-col gap-4 p-2">
      <div className="flex flex-col items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workspaces</h1>
          <p className="text-sm text-muted-foreground">
            Pick a workspace to jump in, or create a new one.
          </p>
        </div>
        {workspaces.length > 0 && <CreateWorkspaceDialog />}
      </div>

      {workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <p className="text-sm text-muted-foreground">
            You don&apos;t have any workspaces yet.
          </p>
          <CreateWorkspaceDialog label="Create your first workspace" />
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 mid:grid-cols-3 gap-2">
          {workspaces.map((workspace) => (
            <WorkspaceCard key={workspace.id} workspace={workspace} />
          ))}
        </section>
      )}
    </div>
  );
}
