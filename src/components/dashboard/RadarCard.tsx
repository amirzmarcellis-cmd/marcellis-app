import React from "react"
import { Card, CardContent } from "@/components/ui/card"

interface RadarStats {
  longlist: number
  shortlist: number
  tasked: number
  hired: number
}

interface RadarCardProps {
  title?: string
  stats: RadarStats
}

export function RadarCard({ title = "Ops Radar", stats }: RadarCardProps) {
  const total = Math.max(1, stats.longlist + stats.shortlist + stats.tasked + stats.hired)
  const sizeFor = (n: number) => 6 + (n / total) * 16 // 6–22px

  return (
    <Card className="bg-gradient-card border border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span>Longlist {stats.longlist}</span>
            <span>Shortlist {stats.shortlist}</span>
            <span>Tasked {stats.tasked}</span>
            <span>Hired {stats.hired}</span>
          </div>
        </div>
        <div className="relative h-56">
          <div className="absolute inset-0 rounded-full border border-border/40 mx-auto my-0 w-56 h-56 left-1/2 -translate-x-1/2" />
          <div className="absolute inset-0 rounded-full mx-auto my-0 w-56 h-56 left-1/2 -translate-x-1/2 overflow-hidden">
            <div
              className="absolute inset-0 rounded-full opacity-40 animate-[spin_6s_linear_infinite]"
              aria-hidden="true"
              style={{
                background: "conic-gradient(from 0deg, hsl(var(--primary)/0.3), transparent 60deg, transparent)",
              }}
            />
          </div>
          {/* Blips */}
          <span
            className="absolute rounded-full bg-cyan/70 shadow-glow"
            style={{ width: sizeFor(stats.longlist), height: sizeFor(stats.longlist), left: "25%", top: "30%" }}
            aria-label={`Longlist ${stats.longlist}`}
          />
          <span
            className="absolute rounded-full bg-purple/70 shadow-glow-purple"
            style={{ width: sizeFor(stats.shortlist), height: sizeFor(stats.shortlist), left: "65%", top: "40%" }}
            aria-label={`Shortlist ${stats.shortlist}`}
          />
          <span
            className="absolute rounded-full bg-blue/70 shadow-glow-blue"
            style={{ width: sizeFor(stats.tasked), height: sizeFor(stats.tasked), left: "40%", top: "65%" }}
            aria-label={`Tasked ${stats.tasked}`}
          />
          <span
            className="absolute rounded-full bg-success/80 shadow-glow"
            style={{ width: sizeFor(stats.hired), height: sizeFor(stats.hired), left: "55%", top: "20%" }}
            aria-label={`Hired ${stats.hired}`}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default RadarCard
