"use client"

import { useClientNav } from "./ClientNavContext"
import { Activity } from "@/types/schema"
import { Client } from "@/types/client"
import ReactMarkdown from "react-markdown";



function formatOrdinalDate(date: Date) {
  const day = date.getDate()
  const suffix =
    day % 10 === 1 && day !== 11 ? "st" :
    day % 10 === 2 && day !== 12 ? "nd" :
    day % 10 === 3 && day !== 13 ? "rd" : "th"
  const month = date.toLocaleDateString("en-US", { month: "long" })
  const year = date.getFullYear()
  return `${day}${suffix}, ${month} ${year}`
}

function ActivityPanel({ activities }: { activities: Activity[] | undefined }) {
  // Replace with a real activity/timeline query once you have one
  return (
    <div className="flex flex-col gap-2 text-sm ">
      {activities ? 
      activities?.map(act => (
        <div className="activities flex-col flex " key={act.id}>
          <span>{act?.message}</span><span className="text-gray-400">{formatOrdinalDate(act?.createdAt)}</span>
        </div> 
      ))
      : <p>No activity yet.</p>
    }
    {/* activities */}
    </div>
  )
}

function SettingsPanel({ client }: { client: Client }) {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-400">Status</span>
        <span className="font-medium">{client.status}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">Industry</span>
        <span className="font-medium">{client.industry ?? "—"}</span>
      </div>
    </div>
  )
}

function DetailPanel({ client }: { client: Client }) {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <div>
        <span className="text-gray-400 block mb-1">Notes</span>
        <ReactMarkdown>{client.notes ?? "___No notes yet.___"}</ReactMarkdown>
      </div>
    </div>
  )
}

export default function ClientContent({ client, activities }: { client: Client, activities: Activity[] | undefined }) {
  const { active } = useClientNav()

  return (
    <div className="min-h-70">
      {active === "Activity" && <ActivityPanel activities={activities}/>}
      {active === "Settings" && <SettingsPanel client={client} />}
      {active === "Detail" && <DetailPanel client={client} />}
    </div>
  )
}
