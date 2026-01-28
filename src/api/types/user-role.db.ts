/**
 * User Role table types (junction table)
 */

export interface UserRoleRow {
  assigned_at: string | null
  role_id: string
  user_id: string
}

export interface UserRoleInsert {
  assigned_at?: string | null
  role_id: string
  user_id: string
}

export interface UserRoleUpdate {
  assigned_at?: string | null
  role_id?: string
  user_id?: string
}
