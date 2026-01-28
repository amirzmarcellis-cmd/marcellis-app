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
        "relative overflow-hidden rounded-xl border border-border/50 bg-card p-4 transition-all duration-200 hover:border-border min-w-0 max-w-full",
        onClick && "cursor-pointer hover:bg-accent/5",
        className
      )}
    >
      <div className="flex items-start justify-between min-w-0">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
            {title}
          </p>
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="text-3xl font-semibold text-foreground truncate">{value}</span>
            {delta && (
              <span className={cn("text-sm font-medium", deltaColor[deltaType])}>
                {delta}
              </span>
            )}
          </div>
        </div>
        <div className="rounded-lg bg-muted/50 p-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
      {trend.length > 0 && (
        <div className="mt-3">
          <Sparkline data={trend} />
        </div>
      )}
    </div>
  );
}
