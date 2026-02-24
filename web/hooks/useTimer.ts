"use client"

import { getElapsedSeconds } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"

export function useTimer(startedAt: string | null) {
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!startedAt) {
      setElapsed(0)
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    // Calculate initial elapsed time (works even after tab was in background)
    setElapsed(getElapsedSeconds(startedAt))

    intervalRef.current = setInterval(() => {
      setElapsed(getElapsedSeconds(startedAt))
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [startedAt])

  // Re-sync when tab becomes visible again (background recovery)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && startedAt) {
        setElapsed(getElapsedSeconds(startedAt))
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [startedAt])

  return elapsed
}
