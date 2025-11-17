import React from "react"
import { cn } from "@/lib/utils"

interface BentoKpisProps {
  children: React.ReactNode
  className?: string
}

export function BentoKpis({ children, className }: BentoKpisProps) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4", className)}>
      {children}
    </div>
  )
}
