import React from "react"
import { cn } from "@/lib/utils"

interface RulerScoreProps {
  value: number
  className?: string
}

const clamp = (v: number) => {
  const n = Number.isFinite(v) ? v : 0
  return Math.max(0, Math.min(100, n))
}

export default function RulerScore({ value, className }: RulerScoreProps) {
  const pct = clamp(value)
  const ticks = Array.from({ length: 11 }, (_, i) => i)

  return (
    <div
      className={cn(
        "relative h-8 w-full overflow-hidden rounded-md border border-border bg-muted/60",
        className
      )}
      role="img"
      aria-label={`Success score ${pct} out of 100`}
    >
      {/* Fill */}
      <div
        className="absolute inset-y-0 left-0 bg-gradient-primary bg-primary/70"
        style={{ width: `${pct}%` }}
      />

      {/* Ticks */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-1">
        {ticks.map((i) => (
          <div key={i} className="relative flex items-center" style={{ width: 0 }}>
            <div className={cn("w-px bg-border", i % 5 === 0 ? "h-6" : "h-4")} />
          </div>
        ))}
      </div>
    </div>
  )
}
