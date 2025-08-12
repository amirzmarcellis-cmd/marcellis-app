import { useEffect, useRef, useState } from "react"
import WaveSurfer from "wavesurfer.js"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Pause, Play, Volume2 } from "lucide-react"

interface WaveformPlayerProps {
  url: string
}

export default function WaveformPlayer({ url }: WaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)

  useEffect(() => {
    if (!containerRef.current) return

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "hsl(var(--primary) / 0.3)",
      progressColor: "hsl(var(--primary))",
      cursorColor: "hsl(var(--foreground))",
      height: 64,
      barWidth: 2,
      barGap: 1,
      normalize: true,
      interact: true,
    })

    wavesurferRef.current = ws

    ws.on("ready", () => setIsReady(true))
    ws.on("play", () => setIsPlaying(true))
    ws.on("pause", () => setIsPlaying(false))

    ws.load(url)

    return () => {
      ws.destroy()
      wavesurferRef.current = null
    }
  }, [url])

  useEffect(() => {
    wavesurferRef.current?.setVolume(volume)
  }, [volume])

  const togglePlay = () => {
    if (!wavesurferRef.current || !isReady) return
    wavesurferRef.current.playPause()
  }

  return (
    <div className="space-y-3">
      <div ref={containerRef} className="rounded-md border border-border/50 bg-background/50" />
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={togglePlay} disabled={!isReady}>
          {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <Slider
            value={[volume * 100]}
            onValueChange={(v) => setVolume((v[0] ?? 100) / 100)}
            className="w-40"
          />
        </div>
      </div>
    </div>
  )
}
