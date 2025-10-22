import React, { useState } from "react";
import { Search, Database, Linkedin, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ExpandableSearchButtonProps {
  onSearchLinkedIn: () => void;
  onSearchDatabase: () => void;
  onSearchBoth: () => void;
  disabled?: boolean;
}

export function ExpandableSearchButton({
  onSearchLinkedIn,
  onSearchDatabase,
  onSearchBoth,
  disabled = false,
}: ExpandableSearchButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleOptionClick = (callback: () => void) => {
    callback();
    setIsExpanded(false);
  };

  return (
    <div className="relative">
      {/* Main Button */}
      <Button
        onClick={handleToggle}
        size="sm"
        variant="outline"
        disabled={disabled}
        className={cn(
          "relative overflow-hidden transition-all duration-500 ease-out",
          "hover:shadow-lg hover:shadow-primary/20 hover:border-primary/50",
          "active:scale-95",
          isExpanded && "bg-accent/10 border-primary/30 shadow-md shadow-primary/10"
        )}
      >
        <Search className={cn(
          "w-4 h-4 mr-2 transition-transform duration-500",
          isExpanded && "rotate-90"
        )} />
        Regenerate AI
      </Button>

      {/* Expanded Options */}
      <div
        className={cn(
          "absolute top-full right-0 mt-3 min-w-[220px] origin-top-right z-50",
          "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isExpanded
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-90 -translate-y-4 pointer-events-none"
        )}
      >
        <div className="relative rounded-2xl border border-border/40 bg-background/80 backdrop-blur-2xl shadow-2xl overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          
          <div className="relative p-2 space-y-1">
            <button
              onClick={() => handleOptionClick(onSearchLinkedIn)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all duration-300 ease-out group hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, transparent 0%, rgba(59, 130, 246, 0.08) 100%)'
              }}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/20">
                <Linkedin className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="font-light text-foreground/90 group-hover:text-foreground transition-colors">LinkedIn</span>
            </button>

            <button
              onClick={() => handleOptionClick(onSearchDatabase)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all duration-300 ease-out group hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, transparent 0%, rgba(168, 85, 247, 0.08) 100%)'
              }}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/20">
                <Database className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="font-light text-foreground/90 group-hover:text-foreground transition-colors">Database</span>
            </button>

            <button
              onClick={() => handleOptionClick(onSearchBoth)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all duration-300 ease-out group hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, transparent 0%, rgba(6, 182, 212, 0.08) 100%)'
              }}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-cyan-500/20">
                <Layers className="w-4 h-4 text-cyan-500 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="font-light text-foreground/90 group-hover:text-foreground transition-colors">Search Both</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop overlay */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}
