"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import type { Project } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { FolderOpen, Pencil, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

const PROJECT_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f97316", "#eab308",
  "#10b981", "#06b6d4", "#3b82f6", "#ef4444", "#64748b",
]

interface ProjectsClientProps {
  projects: Project[]
}

const emptyForm = {
  name: "",
  description: "",
  client: "",
  hourly_rate: "",
  color: "#6366f1",
}

export function ProjectsClient({ projects }: ProjectsClientProps) {
  const supabase = createClient()
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(project: Project) {
    setEditing(project)
    setForm({
      name: project.name,
      description: project.description,
      client: project.client,
      hourly_rate: project.hourly_rate ? project.hourly_rate.toString() : "",
      color: project.color,
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      client: form.client.trim(),
      hourly_rate: parseFloat(form.hourly_rate) || 0,
      color: form.color,
      updated_at: new Date().toISOString(),
    }

    if (editing) {
      await supabase.from("projects").update(payload).eq("id", editing.id)
    } else {
      await supabase.from("projects").insert({ ...payload, user_id: user.id })
    }

    setLoading(false)
    setDialogOpen(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    await supabase.from("projects").delete().eq("id", id)
    setDeleteConfirm(null)
    router.refresh()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Projetos</h1>
          <p className="text-slate-500 text-sm mt-1">{projects.length} projeto{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} />
          Novo projeto
        </Button>
      </div>

      {/* List */}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center gap-3 text-center">
            <FolderOpen size={40} className="text-slate-300" />
            <div>
              <p className="text-slate-700 dark:text-slate-300 font-medium">Nenhum projeto ainda</p>
              <p className="text-slate-400 text-sm">Crie seu primeiro projeto para começar a registrar horas</p>
            </div>
            <Button onClick={openCreate} className="mt-2">
              <Plus size={16} />
              Criar projeto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-4 py-4">
                <div
                  className="w-10 h-10 rounded-lg shrink-0"
                  style={{ backgroundColor: project.color + "20" }}
                >
                  <div
                    className="w-full h-full rounded-lg flex items-center justify-center text-lg font-bold"
                    style={{ color: project.color }}
                  >
                    {project.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {project.name}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {project.client && (
                      <span className="text-xs text-slate-500">{project.client}</span>
                    )}
                    {project.description && (
                      <span className="text-xs text-slate-400 truncate">{project.description}</span>
                    )}
                  </div>
                </div>

                {project.hourly_rate > 0 && (
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(project.hourly_rate)}
                    </p>
                    <p className="text-xs text-slate-400">por hora</p>
                  </div>
                )}

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(project)}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(project.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? "Editar projeto" : "Novo projeto"}
      >
        <div className="space-y-4">
          <Input
            id="name"
            label="Nome do projeto *"
            placeholder="Ex: Site institucional"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            id="client"
            label="Cliente"
            placeholder="Ex: Empresa XYZ"
            value={form.client}
            onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))}
          />
          <Input
            id="description"
            label="Descrição"
            placeholder="Detalhes do projeto..."
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <Input
            id="hourly_rate"
            label="Valor por hora (R$)"
            type="number"
            min="0"
            step="0.01"
            placeholder="0,00"
            value={form.hourly_rate}
            onChange={(e) => setForm((f) => ({ ...f, hourly_rate: e.target.value }))}
          />

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
              Cor
            </label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color }))}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none"
                  style={{
                    backgroundColor: color,
                    outline: form.color === color ? `3px solid ${color}` : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} loading={loading} disabled={!form.name.trim()}>
              {editing ? "Salvar" : "Criar projeto"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Excluir projeto"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Tem certeza? Isso vai excluir o projeto e <strong>todos os registros de horas</strong> associados. Essa ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              Excluir
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
