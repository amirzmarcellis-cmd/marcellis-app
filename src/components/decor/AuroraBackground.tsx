import React from "react"
import { cn } from "@/lib/utils"

interface AuroraBackgroundProps {
  className?: string
}

export function AuroraBackground({ className }: AuroraBackgroundProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden opacity-80",
        className
      )}
      aria-hidden="true"
    >
      {/* Soft aurora blobs using design tokens and gradients */}
      <div className="absolute -top-24 left-10 h-72 w-72 rounded-full blur-3xl opacity-25 bg-gradient-hero animate-pulse" />
      <div className="absolute top-1/3 -right-10 h-96 w-96 rounded-full blur-3xl opacity-20 bg-gradient-accent animate-pulse delay-1000" />
      <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full blur-3xl opacity-20 bg-gradient-secondary animate-pulse delay-2000" />
    </div>
  )
}
