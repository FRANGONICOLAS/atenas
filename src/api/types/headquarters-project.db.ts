/**
 * Headquarters Project table types (junction table)
 */

export interface HeadquartersProjectRow {
  assigned_at: string | null
  headquarters_id: string
  project_id: string
}

export interface HeadquartersProjectInsert {
  assigned_at?: string | null
  headquarters_id: string
  project_id: string
}

export interface HeadquartersProjectUpdate {
  assigned_at?: string | null
  headquarters_id?: string
  project_id?: string
}
