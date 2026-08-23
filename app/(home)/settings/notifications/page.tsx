import Link from 'next/link'
import { ArrowLeft } from "lucide-react"

export default function page() {
  return (
    <div>
      <div className="flex">
        <Link
            href="/settings/"
            className="rounded-lg p-2 hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        <h1 className="text-2xl font-bold italic">Notifications</h1>
      </div>
    </div>
  )
}