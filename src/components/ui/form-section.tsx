import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FormSectionProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  icon: Icon,
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div
      className={cn(
        "group relative rounded-xl border border-border/40 bg-card/30 p-5 transition-all duration-300",
        "hover:border-primary/30 hover:bg-card/50 hover:shadow-[0_0_30px_hsl(var(--primary)/0.08)]",
        className
      )}
    >
      {/* Section Header */}
      <div className="mb-4 flex items-center gap-3">
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-medium uppercase tracking-wider text-foreground/90">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>

      {/* Section Content */}
      <div className="space-y-4">{children}</div>
    </div>
  );
}
