/**
 * Project table types
 */

export interface ProjectRow {
  category: string | null
  description: string | null
  end_date: string | null
  finance_goal: number | null
  name: string
  project_id: string
  start_date: string | null
  status: string
  type: string | null
}

export interface ProjectInsert {
  category?: string | null
  description?: string | null
  end_date?: string | null
  finance_goal?: number | null
  name: string
  project_id?: string
  start_date?: string | null
  status?: string
  type?: string | null
}

export interface ProjectUpdate {
  category?: string | null
  description?: string | null
  end_date?: string | null
  finance_goal?: number | null
  name?: string
  project_id?: string
  start_date?: string | null
  status?: string
  type?: string | null
}
