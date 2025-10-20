import { cn } from "@/lib/utils"

interface ProgressiveStatusBarProps {
  status: string
  className?: string
}

// Status stages in order
const STATUS_STAGES = ["Active", "Sourcing", "Making Calls", "Complete"]

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
          const isPassed = index < activeIndex
          const isCurrent = index === activeIndex
          const isNotReached = index > activeIndex
          
          return (
            <div
              key={stage}
              className="flex flex-col items-center gap-3 transition-all duration-700"
            >
              {/* Stage label */}
              <span
                className={cn(
                  "text-xs font-semibold transition-all duration-700 text-center",
                  isPassed && "text-white",
                  isCurrent && "text-primary",
                  isNotReached && "text-muted-foreground/50"
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
