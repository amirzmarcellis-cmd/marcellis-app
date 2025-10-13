import * as React from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.ComponentProps<typeof Card> {}

export function GlassCard({ className, children, ...props }: GlassCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border border-border/50 bg-card/30 backdrop-blur-xl shadow-card transition-all duration-500 will-change-transform hover:shadow-elevated hover:scale-[1.01] hover:border-primary/30 rounded-2xl",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  )
}
