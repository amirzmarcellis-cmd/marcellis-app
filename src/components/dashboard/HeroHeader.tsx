import React from "react";
import { cn } from "@/lib/utils";
interface HeroHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}
export function HeroHeader({
  title,
  subtitle,
  actions,
  className
}: HeroHeaderProps) {
  return <header className={cn("mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        <h1 className="text-7xl sm:text-8xl font-light font-work tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && <p className="text-base font-light font-inter text-muted-foreground mt-4">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>;
}