import { cn } from "@/lib/utils";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  onLabel?: string;
  offLabel?: string;
  size?: "sm" | "md" | "lg";
}

export function ToggleSwitch({ 
  checked, 
  onChange, 
  disabled = false,
  onLabel = "ON",
  offLabel = "OFF",
  size = "md"
}: ToggleSwitchProps) {
  const sizeClasses = {
    sm: {
      container: "h-8 w-20",
      toggle: "h-6 w-6",
      text: "text-xs"
    },
    md: {
      container: "h-10 w-28",
      toggle: "h-8 w-8",
      text: "text-sm"
    },
    lg: {
      container: "h-14 w-40",
      toggle: "h-11 w-11",
      text: "text-base"
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "relative inline-flex items-center rounded-full transition-all duration-300 shadow-lg",
        "bg-gradient-to-br border-2",
        currentSize.container,
        checked 
          ? "from-emerald-400 to-emerald-600 border-emerald-700" 
          : "from-red-400 to-red-600 border-red-700",
        disabled && "opacity-50 cursor-not-allowed",
        !disabled && "cursor-pointer hover:shadow-xl"
      )}
      style={{
        boxShadow: checked 
          ? "0 4px 14px 0 rgba(16, 185, 129, 0.39), inset 0 2px 4px rgba(0, 0, 0, 0.2)"
          : "0 4px 14px 0 rgba(239, 68, 68, 0.39), inset 0 2px 4px rgba(0, 0, 0, 0.2)"
      }}
    >
      {/* Label text */}
      <span 
        className={cn(
          "absolute font-bold transition-all duration-300",
          currentSize.text,
          checked ? "left-3 text-black" : "right-3 text-black"
        )}
      >
        {checked ? onLabel : offLabel}
      </span>

      {/* Toggle circle */}
      <span
        className={cn(
          "absolute bg-gradient-to-br from-slate-700 to-slate-900 rounded-full transition-all duration-300 shadow-lg border-2 border-slate-800",
          "flex items-center justify-center",
          currentSize.toggle,
          checked ? "right-1" : "left-1"
        )}
        style={{
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Concentric circles for 3D effect */}
        <span className="absolute inset-1 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 opacity-60" />
        <span className="absolute inset-2 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 opacity-80" />
        <span className="absolute inset-[10px] rounded-full bg-gradient-to-br from-slate-800 to-black opacity-90" />
      </span>
    </button>
  );
}
