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
        // Mobile: inset boundary (cannot be clipped) + visible bg + compact padding + outline safeguard
        "relative rounded-xl border bg-white/15 border-white/25 ring-1 ring-white/10",
        "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18),0_6px_18px_rgba(0,0,0,0.55)]",
        "outline outline-1 outline-white/10 outline-offset-0",
        "p-1.5 transition-all duration-200 min-w-0 max-w-full",
        // Desktop: revert to original subtle styling
        "sm:bg-card sm:border-border/60 sm:ring-0 sm:shadow-none sm:p-2 sm:outline-none",
        // Hover: mobile keeps white border, desktop uses theme
        "hover:border-white/30 sm:hover:border-border",
        onClick && "cursor-pointer hover:bg-accent/5",
        className
      )}
    >
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
