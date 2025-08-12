import React, { useMemo } from "react"
import { cn } from "@/lib/utils"

interface ParticlesProps {
  count?: number
  className?: string
}

export function Particles({ count = 48, className }: ParticlesProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.floor(Math.random() * 2000),
        size: Math.random() * 2 + 1,
      })),
    [count]
  )

  return (
    <div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-primary/40 animate-pulse"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            filter: "blur(0.5px)",
            animationDelay: `${p.delay}ms`,
          }}
        />
      ))}
    </div>
  )
}

export default Particles
