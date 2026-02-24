export const dynamic = "force-dynamic"

import { ActiveTimerCard } from "@/components/ActiveTimer"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { formatDate, formatDuration, formatHours, formatTime } from "@/lib/utils"
import { Clock, FolderOpen, TrendingUp } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Load all needed data in parallel
  const [
    { data: projects },
    { data: activeTimerRaw },
    { data: recentEntries },
    { data: allEntries },
  ] = await Promise.all([
    supabase.from("projects").select("*").eq("user_id", user.id).order("name"),
    supabase.from("active_timers").select("*, project:projects(*)").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("time_entries")
      .select("*, project:projects(name, color, client)")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(5),
    supabase
      .from("time_entries")
      .select("started_at, ended_at")
      .eq("user_id", user.id)
      .not("ended_at", "is", null),
  ])

  // Calculate total hours this month
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthEntries = allEntries?.filter((e) => e.started_at >= startOfMonth) ?? []
  const totalSecondsMonth = monthEntries.reduce((acc, e) => {
    if (!e.ended_at) return acc
    return acc + Math.floor((new Date(e.ended_at).getTime() - new Date(e.started_at).getTime()) / 1000)
  }, 0)

  // Total all time
  const totalSecondsAll = (allEntries ?? []).reduce((acc, e) => {
    if (!e.ended_at) return acc
    return acc + Math.floor((new Date(e.ended_at).getTime() - new Date(e.started_at).getTime()) / 1000)
  }, 0)

  const firstName = user.email?.split("@")[0] ?? "freelancer"

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Olá, {firstName} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(now)}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center shrink-0">
              <Clock size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Horas este mês</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{formatHours(totalSecondsMonth)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center shrink-0">
              <TrendingUp size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total registrado</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{formatHours(totalSecondsAll)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center shrink-0">
              <FolderOpen size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Projetos ativos</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{projects?.length ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timer + Recent entries */}
      <div className="grid grid-cols-5 gap-6">
        {/* Timer */}
        <div className="col-span-2">
          <ActiveTimerCard
            activeTimer={activeTimerRaw ?? null}
            projects={projects ?? []}
          />
        </div>

        {/* Recent entries */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Registros recentes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!recentEntries || recentEntries.length === 0 ? (
                <div className="px-6 py-8 text-center text-slate-400 text-sm">
                  Nenhum registro ainda. Inicie um timer!
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                  {recentEntries.map((entry) => {
                    const durationSec = entry.ended_at
                      ? Math.floor((new Date(entry.ended_at).getTime() - new Date(entry.started_at).getTime()) / 1000)
                      : null
                    const proj = Array.isArray(entry.project) ? entry.project[0] : entry.project

                    return (
                      <li key={entry.id} className="px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: proj?.color ?? "#6366f1" }}
                          />
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {proj?.name ?? "—"}
                            </p>
                            <p className="text-xs text-slate-400">
                              {formatDate(entry.started_at)} · {formatTime(entry.started_at)}
                            </p>
                          </div>
                        </div>
                        <Badge variant="default">
                          {durationSec !== null ? formatDuration(durationSec) : "em andamento"}
                        </Badge>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
