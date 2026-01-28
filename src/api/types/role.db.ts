/**
 * Role table types
 */

export interface RoleRow {
  role_id: string
  role_name: string
}

export interface RoleInsert {
  role_id: string
  role_name: string
}

export interface RoleUpdate {
  role_id?: string
  role_name?: string
}
