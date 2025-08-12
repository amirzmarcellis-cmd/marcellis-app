import React from "react"
import { cn } from "@/lib/utils"

interface HeroHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
}

export function HeroHeader({ title, subtitle, actions, className }: HeroHeaderProps) {
  return (
    <header className={cn("mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}
