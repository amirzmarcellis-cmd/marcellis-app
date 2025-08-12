import * as React from "react"
import { cn } from "@/lib/utils"
import { AuroraBackground } from "@/components/decor/AuroraBackground"
import { CosmicGrid } from "@/components/decor/CosmicGrid"
import { Particles } from "@/components/decor/Particles"
import { SpotlightCursor } from "@/components/effects/SpotlightCursor"

interface MissionBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {}

export function MissionBackground({ className, children, ...props }: MissionBackgroundProps) {
  return (
    <div className={cn("relative min-h-screen bg-background text-foreground overflow-hidden", className)} {...props}>
      {/* Cinematic background layers */}
      <AuroraBackground />
      <CosmicGrid />
      <Particles />
      <SpotlightCursor />

      {/* Foreground content */}
      <div className="relative z-20">{children}</div>
    </div>
  )
}

export default MissionBackground
