/**
 * Headquarters table types
 */

export interface HeadquartersRow {
  address: string | null
  city: string | null
  created_at: string | null
  headquarters_id: string
  image_url: string | null
  name: string
  status: string
  user_id: string
}

export interface HeadquartersInsert {
  address?: string | null
  city?: string | null
  created_at?: string | null
  headquarters_id?: string
  image_url?: string | null
  name: string
  status?: string
  user_id: string
}

export interface HeadquartersUpdate {
  address?: string | null
  city?: string | null
  created_at?: string | null
  headquarters_id?: string
  image_url?: string | null
  name?: string
  status?: string
  user_id?: string
}
