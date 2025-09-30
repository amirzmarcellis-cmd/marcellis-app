import React from "react"
import { cn } from "@/lib/utils"

interface FuturisticActionButtonProps {
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

export function FuturisticActionButton({ isExpanded, onToggle, children }: FuturisticActionButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-6" style={{ perspective: "1000px" }}>
      {/* Action Buttons Container - Emerge from main button */}
      <div 
        className={cn(
          "flex items-center gap-4 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isExpanded 
            ? "opacity-100 translate-x-0 scale-100" 
            : "opacity-0 translate-x-12 scale-75 pointer-events-none"
        )}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </div>

      {/* Main Toggle Button - 3D Glossy Futuristic */}
      <button
        onClick={onToggle}
        className={cn(
          "relative flex items-center justify-center w-20 h-20 rounded-2xl",
          "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          "group",
          isExpanded ? "scale-90" : "scale-100 hover:scale-105"
        )}
        style={{
          transformStyle: "preserve-3d",
          transform: isExpanded 
            ? "scale(0.9) rotateY(10deg)" 
            : "scale(1) rotateY(0deg)",
        }}
        title="Actions Menu"
      >
        {/* Glossy Background with 3D depth */}
        <div 
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 50%, hsl(var(--primary) / 0.6) 100%)",
            boxShadow: isExpanded
              ? "0 8px 32px hsl(var(--primary) / 0.4), inset 0 -2px 8px rgba(0,0,0,0.3), inset 0 2px 8px rgba(255,255,255,0.2)"
              : "0 12px 48px hsl(var(--primary) / 0.5), 0 0 0 2px hsl(var(--primary) / 0.2), inset 0 -2px 8px rgba(0,0,0,0.3), inset 0 2px 8px rgba(255,255,255,0.2)",
          }}
        />
        
        {/* Animated Glowing Border */}
        <div 
          className={cn(
            "absolute inset-0 rounded-2xl transition-opacity duration-500",
            isExpanded ? "opacity-100" : "opacity-60"
          )}
          style={{
            background: "linear-gradient(135deg, transparent, hsl(var(--primary) / 0.4), transparent)",
            boxShadow: "0 0 20px hsl(var(--primary) / 0.6), inset 0 0 20px hsl(var(--primary) / 0.3)",
            animation: isExpanded ? "pulse 2s ease-in-out infinite" : "none",
          }}
        />

        {/* Glossy Highlight Overlay */}
        <div 
          className="absolute inset-0 rounded-2xl"
          style={{
            background: "linear-gradient(160deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Icon Container with 3D effect */}
        <div 
          className={cn(
            "relative z-10 transition-all duration-500",
            isExpanded && "rotate-180"
          )}
          style={{
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
            transform: isExpanded ? "translateZ(10px)" : "translateZ(0px)",
          }}
        >
          <svg 
            className="w-10 h-10 text-primary-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
          </svg>
        </div>

        {/* Ripple effect on hover */}
        <div 
          className={cn(
            "absolute inset-0 rounded-2xl bg-primary-foreground/10",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          )}
        />
      </button>
    </div>
  )
}
