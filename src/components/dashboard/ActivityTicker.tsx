import React from "react"
import { cn } from "@/lib/utils"

interface ActivityTickerProps {
  items: string[]
  className?: string
}

export function ActivityTicker({ items, className }: ActivityTickerProps) {
  if (!items || items.length === 0) return null
  const line = items.join(" • ")
  return (
    <div className={cn("rounded-lg border border-border/40 bg-gradient-card backdrop-blur-lg p-2", className)}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex h-2 w-2 rounded-full bg-success animate-pulse" aria-hidden="true" />
        <span className="font-medium text-foreground">LIVE</span>
        <div className="marquee-row flex-1">
          <div className="marquee-inner">
            <span className="px-4">{line}</span>
            <span className="px-4">{line}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActivityTicker
