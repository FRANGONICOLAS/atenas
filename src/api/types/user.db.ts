/**
 * User table types
 */

export interface UserRow {
  birthdate: string | null
  created_at: string
  email: string
  first_name: string | null
  headquarter_id: string | null
  id: string
  last_name: string | null
  phone: string | null
  profile_images_id: string | null
  username: string
}

export interface UserInsert {
  birthdate?: string | null
  created_at?: string
  email: string
  first_name?: string | null
  headquarter_id?: string | null
  id?: string
  last_name?: string | null
  phone?: string | null
  profile_images_id?: string | null
  username: string
}

export interface UserUpdate {
  birthdate?: string | null
  created_at?: string
  email?: string
  first_name?: string | null
  headquarter_id?: string | null
  id?: string
  last_name?: string | null
  phone?: string | null
  profile_images_id?: string | null
  username?: string
}
