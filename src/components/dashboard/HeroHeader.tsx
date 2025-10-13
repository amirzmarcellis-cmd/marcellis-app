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
        <h1 className="text-5xl font-light tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        {subtitle && <p className="text-lg font-light text-muted-foreground mt-4">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>;
}