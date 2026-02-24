export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate, formatDuration, formatHours, formatTime } from "@/lib/utils"
import { BarChart3, Clock, DollarSign, TrendingUp } from "lucide-react"

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const [{ data: projects }, { data: entries }] = await Promise.all([
    supabase.from("projects").select("*").eq("user_id", user.id),
    supabase
      .from("time_entries")
      .select("*, project:projects(name, color, client, hourly_rate)")
      .eq("user_id", user.id)
      .not("ended_at", "is", null)
      .order("started_at", { ascending: false }),
  ])

  // Group by project
  const projectStats: Record<string, {
    name: string
    color: string
    client: string
    hourlyRate: number
    totalSeconds: number
    entryCount: number
  }> = {}

  let grandTotalSeconds = 0
  let grandTotalEarnings = 0

  for (const entry of entries ?? []) {
    if (!entry.ended_at) continue
    const proj = Array.isArray(entry.project) ? entry.project[0] : entry.project
    if (!proj) continue

    const secs = Math.floor(
      (new Date(entry.ended_at).getTime() - new Date(entry.started_at).getTime()) / 1000
    )

    if (!projectStats[entry.project_id]) {
      projectStats[entry.project_id] = {
        name: proj.name,
        color: proj.color,
        client: proj.client,
        hourlyRate: proj.hourly_rate ?? 0,
        totalSeconds: 0,
        entryCount: 0,
      }
    }

    projectStats[entry.project_id].totalSeconds += secs
    projectStats[entry.project_id].entryCount += 1
    grandTotalSeconds += secs
    if (proj.hourly_rate) {
      grandTotalEarnings += (secs / 3600) * proj.hourly_rate
    }
  }

  const sortedProjects = Object.entries(projectStats).sort(
    (a, b) => b[1].totalSeconds - a[1].totalSeconds
  )

  // This month stats
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthEntries = (entries ?? []).filter((e) => e.started_at >= startOfMonth)
  const monthSeconds = monthEntries.reduce((acc, e) => {
    if (!e.ended_at) return acc
    return acc + Math.floor((new Date(e.ended_at).getTime() - new Date(e.started_at).getTime()) / 1000)
  }, 0)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Relatórios</h1>
        <p className="text-slate-500 text-sm mt-1">Visão geral do seu trabalho</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-indigo-500" />
              <p className="text-xs text-slate-500 font-medium">Total registrado</p>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatHours(grandTotalSeconds)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-emerald-500" />
              <p className="text-xs text-slate-500 font-medium">Este mês</p>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatHours(monthSeconds)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-amber-500" />
              <p className="text-xs text-slate-500 font-medium">Faturamento total</p>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(grandTotalEarnings)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-5">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={16} className="text-violet-500" />
              <p className="text-xs text-slate-500 font-medium">Projetos</p>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{projects?.length ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-project breakdown */}
      {sortedProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Por projeto</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {sortedProjects.map(([id, stats]) => {
                const percentage = grandTotalSeconds > 0
                  ? Math.round((stats.totalSeconds / grandTotalSeconds) * 100)
                  : 0
                const earnings = stats.hourlyRate > 0
                  ? (stats.totalSeconds / 3600) * stats.hourlyRate
                  : null

                return (
                  <div key={id} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: stats.color }}
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{stats.name}</p>
                          {stats.client && (
                            <p className="text-xs text-slate-400">{stats.client}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {formatHours(stats.totalSeconds)}
                        </p>
                        {earnings !== null && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(earnings)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${percentage}%`, backgroundColor: stats.color }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 w-8 text-right">{percentage}%</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{stats.entryCount} registro{stats.entryCount !== 1 ? "s" : ""}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All entries log */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico completo</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!entries || entries.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-400 text-sm">
              Nenhum registro ainda.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {entries.slice(0, 50).map((entry) => {
                const proj = Array.isArray(entry.project) ? entry.project[0] : entry.project
                const durationSec = entry.ended_at
                  ? Math.floor((new Date(entry.ended_at).getTime() - new Date(entry.started_at).getTime()) / 1000)
                  : null

                return (
                  <div key={entry.id} className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: proj?.color ?? "#6366f1" }}
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {proj?.name ?? "—"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatDate(entry.started_at)} · {formatTime(entry.started_at)}
                          {entry.ended_at && ` — ${formatTime(entry.ended_at)}`}
                        </p>
                      </div>
                    </div>
                    {durationSec !== null && (
                      <Badge>{formatDuration(durationSec)}</Badge>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
