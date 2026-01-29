import React from "react"
import { cn } from "@/lib/utils"

interface BentoKpisProps {
  children: React.ReactNode
  className?: string
  columns?: 4 | 5
}

export function BentoKpis({ children, className, columns = 4 }: BentoKpisProps) {
  const gridCols = columns === 5 
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" 
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
  
  return (
    <div className={cn("grid gap-1.5 sm:gap-2 w-full min-w-0 max-w-full px-1 sm:px-0", gridCols, className)}>
      {children}
    </div>
  )
}
