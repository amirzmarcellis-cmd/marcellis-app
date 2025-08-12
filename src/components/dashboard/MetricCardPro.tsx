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
  className?: string
}

const accentMap: Record<NonNullable<MetricCardProProps["accent"]>, string> = {
  primary: "text-primary",
  purple: "text-purple",
  cyan: "text-cyan",
  emerald: "text-success",
}

export function MetricCardPro({ title, value, delta, icon: Icon, trend = [], accent = "primary", className }: MetricCardProProps) {
  return (
    <Card className={cn(
      "relative overflow-hidden border border-border/50 bg-gradient-card backdrop-blur-sm hover:shadow-medium transition-all duration-300 hover:scale-[1.02]",
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
          <div className={cn("flex-shrink-0 rounded-md bg-primary/10 p-2", accentMap[accent])}>
            <Icon className={cn("h-5 w-5", accentMap[accent])} />
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
