import React from "react"
import { cn } from "@/lib/utils"

interface BentoKpisProps {
  children: React.ReactNode
  className?: string
}

export function BentoKpis({ children, className }: BentoKpisProps) {
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-5 gap-4 overflow-x-auto", className)}>
      {children}
    </div>
  )
}
