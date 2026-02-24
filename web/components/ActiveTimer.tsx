"use client"

import { Button } from "@/components/ui/button"
import { useTimer } from "@/hooks/useTimer"
import { createClient } from "@/lib/supabase/client"
import type { ActiveTimer, Project } from "@/lib/types"
import { formatDuration } from "@/lib/utils"
import { Square, Timer } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface ActiveTimerCardProps {
  activeTimer: ActiveTimer | null
  projects: Project[]
}

export function ActiveTimerCard({ activeTimer, projects }: ActiveTimerCardProps) {
  const supabase = createClient()
  const router = useRouter()
  const elapsed = useTimer(activeTimer?.started_at ?? null)
  const [loading, setLoading] = useState(false)
  const [selectedProject, setSelectedProject] = useState("")

  const project = projects.find((p) => p.id === activeTimer?.project_id)

  async function startTimer() {
    if (!selectedProject) return
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from("active_timers").upsert({
        user_id: user.id,
        project_id: selectedProject,
        started_at: new Date().toISOString(),
      }, { onConflict: "user_id" })

      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function stopTimer() {
    if (!activeTimer) return
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Save time entry
      await supabase.from("time_entries").insert({
        user_id: user.id,
        project_id: activeTimer.project_id,
        started_at: activeTimer.started_at,
        ended_at: new Date().toISOString(),
      })

      // Remove active timer
      await supabase.from("active_timers").delete().eq("user_id", user.id)

      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  if (activeTimer && project) {
    return (
      <div className="bg-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-3 h-3 bg-emerald-400 rounded-full" />
              <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
            </div>
            <span className="text-indigo-200 text-sm font-medium">Timer ativo</span>
          </div>
          <div
            className="px-2 py-1 rounded-lg text-xs font-medium text-white"
            style={{ backgroundColor: project.color + "40" }}
          >
            {project.client || project.name}
          </div>
        </div>

        <div className="mb-1">
          <p className="text-indigo-200 text-sm">{project.name}</p>
        </div>

        <div className="text-5xl font-bold tracking-tight mb-6 tabular-nums">
          {formatDuration(elapsed)}
        </div>

        <Button
          variant="secondary"
          size="lg"
          onClick={stopTimer}
          loading={loading}
          className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 dark:bg-white/10 dark:border-white/20 dark:text-white dark:hover:bg-white/20"
        >
          <Square size={16} className="fill-current" />
          Parar timer
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4 text-slate-400">
        <Timer size={20} />
        <span className="text-sm font-medium">Iniciar timer</span>
      </div>

      <div className="text-5xl font-bold tracking-tight mb-6 text-slate-300 dark:text-slate-600 tabular-nums">
        00:00:00
      </div>

      <div className="space-y-3">
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Selecione um projeto...</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} {p.client ? `— ${p.client}` : ""}
            </option>
          ))}
        </select>

        <Button
          onClick={startTimer}
          loading={loading}
          disabled={!selectedProject}
          className="w-full"
          size="lg"
        >
          Iniciar timer
        </Button>
      </div>
    </div>
  )
}
