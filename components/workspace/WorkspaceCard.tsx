import Link from "next/link";
import { FolderKanban, Users } from "lucide-react";
import type { WorkspaceSummary } from "@/lib/actions/workspace";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function WorkspaceCard({ workspace,
  clientCount = 0, projectCount = 0}: { workspace: WorkspaceSummary }) {
  return (
    <Link
      href={`/${workspace.slug}/dashboard`}
      className="flex justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
    >
      <div
      className="flex flex-col gap-3 "
      >
        <div>
          <h3 className="font-semibold">{workspace.name}</h3>
          <p className="text-xs text-muted-foreground">{workspace.slug}</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {clientCount} clients
          </span>
          <span className="flex items-center gap-1">
            <FolderKanban className="h-3.5 w-3.5" /> {projectCount} projects
          </span>
        </div>
      </div>
      <Avatar className="w-12 h-12">
        <AvatarImage src={workspace.logo} />
        <AvatarFallback className="font-bold text-xl">{workspace.name[0]}</AvatarFallback>
      </Avatar>
    </Link>
  );
}

export default WorkspaceCard;
