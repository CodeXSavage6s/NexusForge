"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export const CLIENT_TABS = ["Activity", "Settings", "Detail"] as const
export type ClientTab = (typeof CLIENT_TABS)[number]

interface ClientNavContextValue {
  active: ClientTab
  setActive: (tab: ClientTab) => void
}

const ClientNavContext = createContext<ClientNavContextValue | undefined>(undefined)

export function ClientNavProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ClientTab>("Activity")

  return (
    <ClientNavContext.Provider value={{ active, setActive }}>
      {children}
    </ClientNavContext.Provider>
  )
}

export function useClientNav() {
  const ctx = useContext(ClientNavContext)
  if (!ctx) {
    throw new Error("useClientNav must be used within a ClientNavProvider")
  }
  return ctx
}
