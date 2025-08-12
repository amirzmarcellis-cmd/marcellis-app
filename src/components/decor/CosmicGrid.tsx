import React from "react"
import { cn } from "@/lib/utils"

interface CosmicGridProps { className?: string }

export function CosmicGrid({ className }: CosmicGridProps) {
  return (
    <div
      className={cn("cosmic-grid cosmic-grid--animated pointer-events-none", className)}
      aria-hidden="true"
    />
  )
}

export default CosmicGrid
