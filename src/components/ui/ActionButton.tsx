import React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface ActionButtonProps {
  onClick: () => void
  disabled?: boolean
  icon: LucideIcon
  label: string
  variant?: "default" | "danger" | "success"
  delay?: number
}

export function ActionButton({ 
  onClick, 
  disabled, 
  icon: Icon, 
  label, 
  variant = "default",
  delay = 0 
}: ActionButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return "from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800"
      case "success":
        return "from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-800"
      default:
        return "from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70"
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex items-center justify-center w-16 h-16 rounded-full",
        "transition-all duration-300 ease-out",
        "group",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      style={{
        animation: `spring-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms both`,
        transformStyle: "preserve-3d",
      }}
      title={label}
    >
      {/* Glossy 3D Background */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-br",
          getVariantStyles(),
          "group-hover:scale-110 transition-transform duration-300"
        )}
        style={{
          boxShadow: "0 8px 24px rgba(0,0,0,0.3), inset 0 -2px 6px rgba(0,0,0,0.4), inset 0 2px 6px rgba(255,255,255,0.2)",
        }}
      />
      
      {/* Glossy Highlight */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Glowing Border */}
      <div 
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          boxShadow: variant === "danger" 
            ? "0 0 20px rgba(239, 68, 68, 0.6)" 
            : variant === "success"
            ? "0 0 20px rgba(16, 185, 129, 0.6)"
            : "0 0 20px hsl(var(--primary) / 0.6)",
        }}
      />

      {/* Icon */}
      <Icon 
        className="w-6 h-6 text-white relative z-10 drop-shadow-lg" 
        style={{
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
        }}
      />
    </button>
  )
}
