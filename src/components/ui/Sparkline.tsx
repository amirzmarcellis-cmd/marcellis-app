import React from "react"
import { ResponsiveContainer, LineChart, Line } from "recharts"
import { cn } from "@/lib/utils"

interface SparklineProps {
  data: number[]
  className?: string
}

export function Sparkline({ data, className }: SparklineProps) {
  const chartData = data.map((v, i) => ({ i, v }))
  return (
    <div className={cn("h-5 sm:h-12 w-full text-primary", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
          <Line type="monotone" dataKey="v" stroke="currentColor" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )}
