import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { Sparkline } from "@/components/ui/Sparkline"

interface MetricCardProProps {
  title: string
  value: string | number
  delta?: string
  icon: LucideIcon
  trend?: number[]
  accent?: "primary" | "purple" | "cyan" | "emerald"
  progress?: number
  glow?: boolean
  className?: string
}

const accentMap: Record<NonNullable<MetricCardProProps["accent"]>, string> = {
  primary: "text-primary",
  purple: "text-purple",
  cyan: "text-cyan",
  emerald: "text-success",
}

export function MetricCardPro({ title, value, delta, icon: Icon, trend = [], accent = "primary", progress, glow = false, className }: MetricCardProProps) {
  const pct = typeof progress === 'number' ? Math.max(0, Math.min(100, progress)) : undefined
  return (
    <Card className={cn(
      "relative overflow-hidden border border-border/50 bg-gradient-card backdrop-blur-sm hover:shadow-medium transition-all duration-300 hover:scale-[1.02]",
      glow && "animate-pulse-glow",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-foreground">{value}</span>
              {delta && (
                <span className="text-xs text-success">{delta}</span>
              )}
            </div>
          </div>
          <div className={cn("relative flex-shrink-0 text-primary", accentMap[accent])}>
            {typeof pct === 'number' && (
              <div
                aria-hidden="true"
                className="absolute inset-[-6px] rounded-full opacity-40"
                style={{ background: `conic-gradient(currentColor ${pct}%, transparent 0)` }}
              />
            )}
            <div className={cn("relative z-10 rounded-md bg-primary/10 p-2", accentMap[accent])}>
              <Icon className={cn("h-5 w-5", accentMap[accent])} />
            </div>
          </div>
        </div>
        {trend.length > 0 && (
          <div className="mt-2">
            <Sparkline data={trend} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
