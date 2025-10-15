import { Search } from "lucide-react";

export function ProcessingAnimation() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="relative mx-4 max-w-md">
        <div className="mission-card border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-violet-500/10 p-8 text-center shadow-2xl">
          {/* Animated Radar Icon */}
          <div className="relative mx-auto mb-6 h-20 w-20">
            <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/20"></div>
            <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-tr from-purple-500/40 to-violet-500/40"></div>
            <div className="relative flex h-full w-full items-center justify-center rounded-full bg-purple-500/20 backdrop-blur">
              <Search className="h-10 w-10 text-purple-400 animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <h3 className="mb-2 text-xl font-light text-foreground">
            🔍 Searching for Candidates
          </h3>

          {/* Loading Dots */}
          <div className="mb-4 flex justify-center space-x-1">
            <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400"></div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground">
            AI is analyzing requirements and matching potential candidates
          </p>
        </div>
      </div>
    </div>
  );
}
