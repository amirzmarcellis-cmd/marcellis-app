import React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Sparkline } from "@/components/ui/Sparkline";

interface SimpleMetricCardProps {
  title: string;
  value: string | number;
  delta?: string;
  deltaType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  trend?: number[];
  onClick?: () => void;
  className?: string;
}

export function SimpleMetricCard({
  title,
  value,
  delta,
  deltaType = "neutral",
  icon: Icon,
  trend = [],
  onClick,
  className
}: SimpleMetricCardProps) {
  const deltaColor = {
    positive: "text-emerald-400",
    negative: "text-red-400",
    neutral: "text-muted-foreground"
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        // Mobile: slightly smaller + left-aligned with right margin so right border remains visible
        "w-[calc(100%-42px)] ml-0 mr-8 sm:w-full sm:mr-0",
        // Mobile: glass effect with inset ring (cannot be clipped by parent overflow)
        "relative rounded-xl border bg-white/20 border-white/40 ring-1 ring-inset ring-white/20",
        "shadow-[inset_0_0_0_2px_rgba(255,255,255,0.25),0_6px_18px_rgba(0,0,0,0.55)]",
        "p-1 transition-all duration-200 min-w-0 max-w-full overflow-hidden",
        // Desktop: revert to original subtle styling
        "sm:bg-card sm:border-border/60 sm:ring-0 sm:shadow-none sm:p-2",
        // Hover: mobile keeps white border, desktop uses theme
        "hover:border-white/50 sm:hover:border-border",
        onClick && "cursor-pointer hover:bg-accent/5",
        className
      )}
    >
      {/* Mobile-only internal frame - guaranteed visible, cannot be clipped */}
      <span className="absolute inset-0 rounded-xl border border-white/50 pointer-events-none sm:hidden" />
      <div className="flex items-start justify-between min-w-0">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] sm:text-[10px] font-medium text-muted-foreground uppercase tracking-wide truncate mb-0.5">
            {title}
          </p>
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-base sm:text-xl font-semibold text-foreground truncate">{value}</span>
            {delta && (
              <span className={cn("text-xs font-medium", deltaColor[deltaType])}>
                {delta}
              </span>
            )}
          </div>
        </div>
        <div className="rounded-lg bg-muted/50 p-0.5 sm:p-1">
          <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
        </div>
      </div>
      {trend.length > 0 && (
        <div className="mt-0.5 sm:mt-1">
          <Sparkline data={trend} />
        </div>
      )}
    </div>
  );
}
