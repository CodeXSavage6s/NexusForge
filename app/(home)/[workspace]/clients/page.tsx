
export default async function ClientsPage({ params }) {
  
  const { workspace } = await params
  return (
    <div>
      ClientPage{workspace}
    </div>
  )
}