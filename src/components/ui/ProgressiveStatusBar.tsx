import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface ProgressiveStatusBarProps {
  status: string
  className?: string
}

// Status stages in order
const STATUS_STAGES = ["Active", "Sourcing", "Recruiting", "Complete"]

export function ProgressiveStatusBar({ status, className }: ProgressiveStatusBarProps) {
  // Find the current stage index
  const currentIndex = STATUS_STAGES.findIndex(
    (stage) => stage.toLowerCase() === status?.toLowerCase()
  )
  
  // If status doesn't match any stage, default to first stage
  const activeIndex = currentIndex >= 0 ? currentIndex : 0
  
  // Calculate progress percentage (each stage is 25%, 50%, 75%, 100%)
  const progressPercentage = ((activeIndex + 1) / STATUS_STAGES.length) * 100

  return (
    <div className={cn("w-full", className)}>
      {/* Progress bar container */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/30 backdrop-blur-sm">
        {/* Animated progress fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary via-primary/90 to-primary transition-all duration-1000 ease-smooth shadow-[0_0_20px_2px_hsl(var(--primary)/0.4)]"
          style={{ width: `${progressPercentage}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* Status stages */}
      <div className="mt-4 flex items-center justify-between">
        {STATUS_STAGES.map((stage, index) => {
          const isActive = index <= activeIndex
          const isCurrent = index === activeIndex
          
          return (
            <div
              key={stage}
              className="flex flex-col items-center gap-2 transition-all duration-500"
            >
              {/* Stage indicator */}
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-500",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-[0_0_12px_2px_hsl(var(--primary)/0.3)]"
                    : "border-muted-foreground/30 bg-muted/20 text-muted-foreground",
                  isCurrent && "scale-110 animate-pulse-subtle"
                )}
              >
                {isActive && index < activeIndex ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-semibold">{index + 1}</span>
                )}
              </div>
              
              {/* Stage label */}
              <span
                className={cn(
                  "text-xs font-medium transition-all duration-500",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground/60"
                )}
              >
                {stage}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
