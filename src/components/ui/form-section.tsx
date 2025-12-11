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
      <div className="mb-4 flex items-center gap-2">
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
        <div>
          <h3 className="text-sm font-medium tracking-wide text-foreground/80">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>

      {/* Section Content */}
      <div className="space-y-4">{children}</div>
    </div>
  );
}
