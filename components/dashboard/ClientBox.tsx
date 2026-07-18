import ClientCard from '@/components/dashboard/ClientCard'

export default function ClientBox({ title, clients = [], workspace }: { title: string; clients?: Client[], workspace: string }) {
    
  
  return (
    <div className="flex min-h-[200px] w-full flex-col gap-1 rounded-md bg-card p-2 shadow shadow-foreground-secondary">
      <p className="mb-1 text-xl font-bold">{title}</p>

      {clients.length === 0 ? (
        <p className="text-sm text-gray-400 px-1 py-4">No clients yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} projectCount={client.projectCount} workspace={workspace}/>
          ))}
        </div>
      )}
    </div>
  )
}
