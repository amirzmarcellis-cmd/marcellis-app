import React, { useEffect } from "react"

export function SpotlightCursor() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      document.documentElement.style.setProperty("--mx", `${e.clientX}px`)
      document.documentElement.style.setProperty("--my", `${e.clientY}px`)
    }
    window.addEventListener("mousemove", handler)
    return () => window.removeEventListener("mousemove", handler)
  }, [])

  return <div className="spotlight-overlay" aria-hidden="true" />
}

export default SpotlightCursor
