import * as React from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface VariableHintProps {
  variables: string[];
  onInsert?: (variable: string) => void;
  className?: string;
}

export function VariableHint({
  variables,
  onInsert,
  className,
}: VariableHintProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Sparkles className="h-3 w-3" />
        Variables:
      </span>
      {variables.map((variable) => (
        <button
          key={variable}
          type="button"
          onClick={() => onInsert?.(`{${variable}}`)}
          className={cn(
            "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-mono transition-all",
            "bg-primary/10 text-primary/80 hover:bg-primary/20 hover:text-primary",
            "border border-primary/20 hover:border-primary/40",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 focus:ring-offset-background"
          )}
        >
          {`{${variable}}`}
        </button>
      ))}
    </div>
  );
}
