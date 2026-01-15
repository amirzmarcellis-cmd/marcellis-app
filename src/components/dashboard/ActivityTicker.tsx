import React from "react"
import { cn } from "@/lib/utils"
import { User } from "lucide-react"

interface ActivityTickerProps {
  items: string[]
  className?: string
}

export function ActivityTicker({ items, className }: ActivityTickerProps) {
  if (!items || items.length === 0) return null
  
  // Duplicate items for seamless looping
  const duplicatedItems = [...items, ...items]
  
  return (
    <div className={cn(
      "rounded-xl border border-border/40 bg-gradient-card backdrop-blur-lg p-3",
      className
    )}>
      <div className="flex items-center gap-3 text-sm">
        {/* Pulsing LIVE badge */}
        <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-border/40">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
          </span>
          <span className="font-medium text-foreground tracking-wide text-xs uppercase">Live</span>
        </div>
        
        {/* Scrolling items */}
        <div className="marquee-row flex-1 overflow-hidden">
          <div className="marquee-inner">
            {duplicatedItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
                <User className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActivityTicker
