import { cn } from "@/lib/utils"

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
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-muted/20 backdrop-blur-sm">
        {/* Animated progress fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary via-primary to-primary/80 transition-all duration-1000 ease-smooth shadow-[0_0_30px_4px_hsl(var(--primary)/0.6)]"
          style={{ width: `${progressPercentage}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          
          {/* Glowing edge */}
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-white/40 to-transparent animate-pulse-subtle" />
        </div>
      </div>

      {/* Status stages */}
      <div className="mt-6 flex items-start justify-between">
        {STATUS_STAGES.map((stage, index) => {
          const isActive = index <= activeIndex
          const isCurrent = index === activeIndex
          
          return (
            <div
              key={stage}
              className="flex flex-col items-center gap-3 transition-all duration-700"
            >
              {/* Stage indicator - vertical line */}
              <div className="relative flex items-center justify-center h-12">
                <div
                  className={cn(
                    "w-1 h-full rounded-full transition-all duration-700 relative",
                    isActive
                      ? "bg-gradient-to-b from-primary via-primary to-primary/70 shadow-[0_0_20px_4px_hsl(var(--primary)/0.5)]"
                      : "bg-muted-foreground/20",
                    isCurrent && "animate-pulse-glow scale-110"
                  )}
                >
                  {/* Glowing top edge for active states */}
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_3px_hsl(var(--primary)/0.8)] animate-pulse-subtle" />
                  )}
                  
                  {/* Glowing bottom edge for current state */}
                  {isCurrent && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_3px_hsl(var(--primary)/0.8)] animate-pulse-subtle" />
                  )}
                </div>
              </div>
              
              {/* Stage label */}
              <span
                className={cn(
                  "text-xs font-semibold transition-all duration-700 text-center",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground/50",
                  isCurrent && "text-primary animate-pulse-subtle"
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
