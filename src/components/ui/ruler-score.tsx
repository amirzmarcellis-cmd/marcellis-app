import * as React from "react"
import { cn } from "@/lib/utils"

interface RulerScoreProps {
  value: number
  max?: number
  ticks?: number // number of segments (e.g., 10 => every 10%)
  className?: string
  showLabels?: boolean
}

// Displays a ruler-like scale with tick marks and a pointer indicating the score
export function RulerScore({
  value,
  max = 100,
  ticks = 10,
  className,
  showLabels = true,
}: RulerScoreProps) {
  const clamped = Math.max(0, Math.min(value ?? 0, max))
  const percent = (clamped / max) * 100

  return (
    <div className={cn("w-full", className)} aria-label={`Success score ${clamped} out of ${max}`}>
      <div className="relative">
        {/* Track */}
        <div className="h-3 rounded bg-muted" />

        {/* Tick marks */}
        <div className="pointer-events-none absolute inset-0 flex">
          {Array.from({ length: ticks + 1 }).map((_, i) => {
            const isMajor = i % 5 === 0 // major every 50% if ticks=10
            const width = 100 / ticks
            return (
              <div
                key={i}
                style={{ width: `${width}%` }}
                className="h-full relative"
                aria-hidden
              >
                <div
                  className={cn(
                    "absolute left-0 bottom-0 border-l border-border",
                    isMajor ? "h-3" : "h-2"
                  )}
                />
              </div>
            )
          })}
        </div>

        {/* Pointer */}
        <div
          className="absolute -top-1.5 h-5 w-0.5 bg-primary rounded"
          style={{ left: `${percent}%`, transform: "translateX(-50%)" }}
          role="presentation"
          aria-hidden
        />
      </div>

      {showLabels && (
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          <span>0</span>
          <span>50</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  )
}
