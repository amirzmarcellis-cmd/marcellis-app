import * as React from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.ComponentProps<typeof Card> {}

export function GlassCard({ className, children, ...props }: GlassCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border border-border/50 bg-gradient-card backdrop-blur-lg shadow-card transition-transform duration-300 will-change-transform hover:shadow-medium hover:scale-[1.02]",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  )
}
