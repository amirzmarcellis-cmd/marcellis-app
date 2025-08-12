import React from "react"
import { useAppSettings } from "@/contexts/AppSettingsContext"

const SWATCHES: { label: string; hex: string }[] = [
  { label: 'Cyan', hex: '#00FFFF' },
  { label: 'Purple', hex: '#8B5CF6' },
  { label: 'Blue', hex: '#3B82F6' },
  { label: 'Emerald', hex: '#10B981' },
]

export function AccentSwitcher() {
  const { settings, updateSettings } = useAppSettings()
  return (
    <div className="flex items-center gap-2" aria-label="Accent color switcher">
      {SWATCHES.map((s) => (
        <button
          key={s.label}
          onClick={() => updateSettings({ primaryColor: s.hex })}
          title={s.label}
          className={`h-6 w-6 rounded-full border border-border/40 ring-2 ${settings.primaryColor === s.hex ? 'ring-primary' : 'ring-transparent'}`}
          style={{ background: s.hex }}
          aria-pressed={settings.primaryColor === s.hex}
          aria-label={`Set accent ${s.label}`}
        />
      ))}
    </div>
  )
}

export default AccentSwitcher
