import type React from "react"
import { TenantSelector } from "@/components/dashboard/tenant-selector"

interface DashboardHeaderProps {
  heading: string
  text?: string
  children?: React.ReactNode
}

export function DashboardHeader({ heading, text, children }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 px-2">
      <div className="grid gap-1">
        <div className="flex items-center gap-4">
          <TenantSelector />
          <h1 className="font-heading text-3xl md:text-4xl">{heading}</h1>
        </div>
        {text && <p className="text-lg text-muted-foreground">{text}</p>}
      </div>
      {children}
    </div>
  )
}

