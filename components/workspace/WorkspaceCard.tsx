import Link from "next/link";
import { FolderKanban, Users } from "lucide-react";
import type { WorkspaceSummary } from "@/lib/actions/workspace";

export function WorkspaceCard({ workspace }: { workspace: WorkspaceSummary }) {
  return (
    <Link
      href={`/workspace/${workspace.id}`}
      className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
    >
      <div>
        <h2 className="font-semibold">{workspace.name}</h2>
        <p className="text-xs text-muted-foreground">{workspace.slug}</p>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" /> {workspace.clientCount} clients
        </span>
        <span className="flex items-center gap-1">
          <FolderKanban className="h-3.5 w-3.5" /> {workspace.projectCount} projects
        </span>
      </div>
    </Link>
  );
}

export default WorkspaceCard;
