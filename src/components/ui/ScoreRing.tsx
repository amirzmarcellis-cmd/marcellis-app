import React from "react"
import { cn } from "@/lib/utils"

interface ScoreRingProps {
  value: number // 0-100
  size?: number
  stroke?: number
  label?: string
  className?: string
}

export function ScoreRing({ value, size = 72, stroke = 8, label, className }: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0))
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className={cn("inline-flex flex-col items-center justify-center", className)}
         role="img" aria-label={`${clamped} out of 100`}>
      <svg width={size} height={size} className="text-muted">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="transparent"
          className="opacity-20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--primary))"
          strokeWidth={stroke}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-smooth"
        />
        <text
          x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
          className="fill-foreground text-sm font-medium"
        >
          {clamped}
        </text>
      </svg>
      {label && <span className="mt-1 text-xs text-muted-foreground">{label}</span>}
    </div>
  )
}
