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
          "transition-all duration-300 ease-smooth",
          isExpanded && "bg-accent/10"
        )}
      >
        <Search className="w-4 h-4 mr-2" />
        Regenerate AI
      </Button>

      {/* Expanded Options */}
      <div
        className={cn(
          "absolute top-full right-0 mt-2 min-w-[200px] origin-top-right transition-all duration-300 ease-smooth z-50",
          isExpanded
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        )}
      >
        <div className="mission-card border-primary/20 bg-card/95 backdrop-blur-xl shadow-elevated p-2 space-y-1">
          <button
            onClick={() => handleOptionClick(onSearchLinkedIn)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-accent/20 transition-all duration-200 group"
          >
            <div className="p-1.5 rounded-md bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
              <Linkedin className="w-4 h-4 text-blue-500" />
            </div>
            <span className="font-light text-foreground">LinkedIn Only</span>
          </button>

          <button
            onClick={() => handleOptionClick(onSearchDatabase)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-accent/20 transition-all duration-200 group"
          >
            <div className="p-1.5 rounded-md bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
              <Database className="w-4 h-4 text-purple-500" />
            </div>
            <span className="font-light text-foreground">Database Only</span>
          </button>

          <button
            onClick={() => handleOptionClick(onSearchBoth)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-accent/20 transition-all duration-200 group"
          >
            <div className="p-1.5 rounded-md bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
              <Layers className="w-4 h-4 text-cyan-500" />
            </div>
            <span className="font-light text-foreground">Search Both</span>
          </button>
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
