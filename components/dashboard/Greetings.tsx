// components/dashboard/Greetings.tsx
import { Button } from '@/components/ui/button'
import { CreateClientDialog } from '@/components/workspace/CreateClient'

interface GreetingsProps {
  user: string;
  workspaceId: string;
  projectCount?: number;
  clientCount?: number;
}

export default function Greetings({
  user, 
  workspaceId, 
  projectCount = 0, 
  clientCount = 0
}: GreetingsProps) {
  return (
    <div className="flex flex-col gap-3 bg-card p-4 rounded-md w-full shadow-md">
      <div className="flex flex-col gap-1">
        <span className="text-sm text-gray-500">Welcome Back</span>
        <strong className="text-2xl">{user} 👋</strong>
        <div className="text-sm text-gray-500">
          You have <span className="font-medium text-foreground">{projectCount}</span> projects across{" "}
          <span className="font-medium text-foreground">{clientCount}</span> clients
        </div>
      </div>

      <div className="flex gap-2">
        <Button className="bg-purple-700 text-white">+ New Project</Button>
        {/* Safely passed downstream */}
        <CreateClientDialog workspaceId={workspaceId} />
      </div>
    </div>
  )
}
