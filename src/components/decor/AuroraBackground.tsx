import React from "react"
import { cn } from "@/lib/utils"

interface AuroraBackgroundProps {
  className?: string
}

export function AuroraBackground({ className }: AuroraBackgroundProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden opacity-20",
        className
      )}
      aria-hidden="true"
    >
      {/* Extremely subtle aurora blobs */}
      <div className="absolute -top-24 left-10 h-72 w-72 rounded-full blur-3xl opacity-5 bg-gradient-primary animate-pulse" />
      <div className="absolute top-1/3 -right-10 h-96 w-96 rounded-full blur-3xl opacity-5 bg-gradient-primary animate-pulse delay-1000" />
      <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full blur-3xl opacity-5 bg-gradient-primary animate-pulse delay-2000" />
    </div>
  )
}
