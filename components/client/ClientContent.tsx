"use client"

import { useClientNav } from "./ClientNavContext"
import type { Client } from "./types"

function ActivityPanel() {
  // Replace with a real activity/timeline query once you have one
  return (
    <div className="flex flex-col gap-2 text-sm text-gray-400">
      <p>No activity yet.</p>
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
        <p className="whitespace-pre-wrap">{client.notes ?? "No notes yet."}</p>
      </div>
    </div>
  )
}

export default function ClientContent({ client }: { client: Client }) {
  const { active } = useClientNav()

  return (
    <div className="min-h-70">
      {active === "Activity" && <ActivityPanel />}
      {active === "Settings" && <SettingsPanel client={client} />}
      {active === "Detail" && <DetailPanel client={client} />}
    </div>
  )
}
