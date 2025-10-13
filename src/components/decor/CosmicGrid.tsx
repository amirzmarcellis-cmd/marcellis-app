import React from "react"
import { cn } from "@/lib/utils"

interface CosmicGridProps { className?: string }

export function CosmicGrid({ className }: CosmicGridProps) {
  return (
    <div
      className={cn("cosmic-grid pointer-events-none opacity-10", className)}
      aria-hidden="true"
    />
  )
}

export default CosmicGrid
