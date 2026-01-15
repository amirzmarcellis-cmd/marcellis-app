import React from "react"
import { cn } from "@/lib/utils"

interface BentoKpisProps {
  children: React.ReactNode
  className?: string
  columns?: 4 | 5
}

export function BentoKpis({ children, className, columns = 4 }: BentoKpisProps) {
  const gridCols = columns === 5 
    ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" 
    : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"
  
  return (
    <div className={cn("grid gap-3 sm:gap-4", gridCols, className)}>
      {children}
    </div>
  )
}
