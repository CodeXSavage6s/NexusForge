import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button"
import Link from "next/link";
import { CreateProjectDialog } from "@/components/project/CreateProject";
import { Plus } from "lucide-react";

export default function ClientDropMenu({ className, clientId, clientName, workspaceId }: { className: string; clientId: string; clientName: string; workspaceId?: string }) {
  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="flex items-center justify-center" variant="ghost"><span>•</span><span>•</span><span>•</span></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <Link href={`${clientId}/projects`} className="w-full">
              View Projects
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
	          <Link href={`${clientId}/edit`} className="w-full">
	            Edit
	          </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
	          <CreateProjectDialog
	            clientId={clientId}
	            clientName={clientName}
	            workspaceId={workspaceId}
	          >
	            <button>
	              New Project</button>
	          </CreateProjectDialog>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}