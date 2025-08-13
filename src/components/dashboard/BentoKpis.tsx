import React from "react"
import { cn } from "@/lib/utils"

interface BentoKpisProps {
  children: React.ReactNode
  className?: string
}

export function BentoKpis({ children, className }: BentoKpisProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {children}
    </div>
  )
}
