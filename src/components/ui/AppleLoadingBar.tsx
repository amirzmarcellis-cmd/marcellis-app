import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AppleLoadingBarProps {
  isLoading: boolean;
  className?: string;
}

export function AppleLoadingBar({ isLoading, className }: AppleLoadingBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
    } else {
      // Delay hiding to allow fade out animation
      const timer = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div className={cn("relative h-[2px] w-full overflow-hidden", className)}>
      {/* Background subtle glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
      
      {/* Animated loading bar */}
      <div
        className={cn(
          "absolute inset-0 h-full",
          "bg-gradient-to-r from-transparent via-primary/80 to-transparent",
          "shadow-[0_0_12px_2px_hsl(var(--primary)/0.4)]",
          isLoading ? "animate-apple-loading" : "animate-apple-loading-out"
        )}
        style={{
          width: "40%",
        }}
      />
    </div>
  );
}
