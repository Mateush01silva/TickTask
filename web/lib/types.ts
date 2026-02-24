export interface Project {
  id: string
  user_id: string
  name: string
  description: string
  client: string
  hourly_rate: number
  color: string
  created_at: string
  updated_at: string
}

export interface TimeEntry {
  id: string
  user_id: string
  project_id: string
  started_at: string
  ended_at: string | null
  notes: string
  created_at: string
  project?: Project
}

export interface ActiveTimer {
  id: string
  user_id: string
  project_id: string
  started_at: string
  project?: Project
}
