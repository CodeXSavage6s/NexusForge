import { Button } from '@/components/ui/button'

export default function Greetings({
  user, projectCount = 0, clientCount = 0
}: {
  user: string;
  projectCount?: number;
  clientCount?: number;
}) {
  return (
    <div className="flex flex-col gap-3 justify-center bg-card p-4 rounded-md w-full shadow-md shadow-foreground-secondary">
      <div className="flex flex-col gap-1">
        <span className="text-sm text-gray-500">Welcome Back</span>
        <strong className="text-2xl">{user} 👋</strong>
        <div className="text-sm text-gray-500">
          You have <span className="font-medium text-foreground">{projectCount}</span> projects across{" "}
          <span className="font-medium text-foreground">{clientCount}</span> clients
        </div>
      </div>

      <div className="flex gap-2">
        <Button className="bg-purple-700 text-foreground-secondary border border-foreground-secondary">+ New Project</Button>
        <Button className="bg-transparent text-foreground border border-foreground-secondary">+ New Client</Button>
      </div>
    </div>
  )
}
