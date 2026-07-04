import { Button } from '@/components/ui/button'

export default function Greetings({
  user
}) {
  return (
    <div className="flex flex-col gap-2 justify-between lg:flex-row bg-card p-2 rounded-md w-full">
      <div className="flex flex-col">
        <span className="text-sm text-gray-500">Welcome Back</span>
        <strong className="text-2xl">{user} 👋</strong>
        <div className="text-sm text-gray-500">You have <span>15</span> projects across <span>8</span> clients</div>
      </div>
      
      <div className="w-full flex gap-2 justify-between">
        <Button className="w-1/2 bg-purple-700 text-foreground border border-foreground">+ New Project</Button>
        <Button className="w-1/2 bg-transparent text-foreground border border-foreground">+ New Client</Button>
      </div>
    </div>
  )
}