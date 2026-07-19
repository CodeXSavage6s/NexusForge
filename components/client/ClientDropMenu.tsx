import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button"

export default function ClientDropMenu() {
  return (
    <div className="self-end ">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="flex items-center justify-center" variant="ghost"><span>•</span><span>•</span><span>•</span></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            Item 1
          </DropdownMenuItem>
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