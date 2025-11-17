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
  return <header className={cn("mb-6 sm:mb-12 flex flex-col gap-4 sm:gap-6 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && <p className="text-sm sm:text-base lg:text-lg font-light text-muted-foreground mt-2 sm:mt-4">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 w-full sm:w-auto">{actions}</div>}
    </header>;
}