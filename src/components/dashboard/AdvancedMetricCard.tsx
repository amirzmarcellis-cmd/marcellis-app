import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Sparkline } from "@/components/ui/Sparkline";
import { Skeleton } from "@/components/ui/skeleton";

interface AdvancedMetricCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  delta?: string;
  deltaType?: "positive" | "negative";
  progress?: number;
  benchmark?: string;
  chartType?: "waveform" | "bell" | "line" | "none";
  trend?: number[];
  className?: string;
  isLoading?: boolean;
}

// Simple bell curve SVG component
function BellCurve({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 40" className={cn("w-full h-5 sm:h-8 text-cyan-400/60", className)}>
      <path
        d="M0,40 Q25,40 35,20 T50,5 T65,20 T100,40"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Marker line for current position */}
      <line x1="58" y1="0" x2="58" y2="40" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
    </svg>
  );
}

// Simple horizontal line chart
function HorizontalLine({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 20" className={cn("w-full h-4 text-cyan-400/40", className)}>
      <line x1="0" y1="10" x2="100" y2="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="50" cy="10" r="3" fill="currentColor" />
    </svg>
  );
}

export function AdvancedMetricCard({
  icon: Icon,
  title,
  value,
  subtitle,
  delta,
  deltaType = "positive",
  progress,
  benchmark,
  chartType = "none",
  trend = [],
  className,
  isLoading = false,
}: AdvancedMetricCardProps) {
  const pct = typeof progress === "number" ? Math.max(0, Math.min(100, progress)) : undefined;

  if (isLoading) {
    return (
      <Card
        className={cn(
          "relative overflow-hidden border border-border/30 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90 backdrop-blur-xl",
          className
        )}
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-md" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-10 w-20 mb-1" />
          <Skeleton className="h-3 w-32 mb-3" />
          <Skeleton className="h-1.5 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden border border-border/30 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-950/90 backdrop-blur-xl hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 min-w-0 max-w-full",
        className
      )}
    >
      <CardContent className="p-4 sm:p-5 min-w-0">
        {/* Header with icon and delta badge */}
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-3 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
            <div className="rounded-md bg-cyan-500/10 p-1 sm:p-1.5 shrink-0">
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-400" />
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
              {title}
            </span>
          </div>
          {delta && (
            <span
              className={cn(
                "text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 w-fit",
                deltaType === "positive"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-red-500/20 text-red-400"
              )}
            >
              {delta}
            </span>
          )}
        </div>

        {/* Main value */}
        <div className="mb-0.5 sm:mb-1">
          <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            {value}
          </span>
        </div>

        {/* Subtitle or benchmark */}
        {(subtitle || benchmark) && (
          <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3 line-clamp-2">
            {subtitle || benchmark}
          </p>
        )}

        {/* Progress bar */}
        {typeof pct === "number" && (
          <div className="mt-3">
            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        {/* Chart variants */}
        {chartType === "waveform" && trend.length > 0 && (
          <div className="mt-2 sm:mt-3">
            <Sparkline data={trend} className="h-6 sm:h-10 text-cyan-400/70" />
          </div>
        )}

        {chartType === "bell" && (
          <div className="mt-2 sm:mt-3">
            <BellCurve />
          </div>
        )}

        {chartType === "line" && (
          <div className="mt-3">
            <HorizontalLine />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
