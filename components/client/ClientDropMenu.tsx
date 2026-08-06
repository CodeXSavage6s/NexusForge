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

export default function ClientDropMenu({ className, clientId, clientName, workspaceId }: { className: string; clientId: string; clientName: string; workspaceId?: string }) {
  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="flex items-center justify-center" variant="ghost"><span>•</span><span>•</span><span>•</span></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <Link href="edit">
            Edit
          </Link>
          <CreateProjectDialog
            clientId={clientId}
            clientName={clientName}
            workspaceId={workspaceId}
          />
          <DropdownMenuItem>
            Item 2
          </DropdownMenuItem>
          <DropdownMenuItem>
            Item 3
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}