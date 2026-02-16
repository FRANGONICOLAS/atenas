/**
 * Database types index
 * Central export point for all database types
 */

// Base types
export type { Json } from './base.db'

// Main Database type and utilities
export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  CompositeTypes,
} from './database.db'

export { Constants } from './database.db'

// Individual table types - Beneficiary
export type {
  BeneficiaryRow,
  BeneficiaryInsert,
  BeneficiaryUpdate,
} from './beneficiary.db'

// Bold Transactions
export type {
  BoldTransactionsRow,
  BoldTransactionsInsert,
  BoldTransactionsUpdate,
} from './bold-transactions.db'

// Donation
export type {
  DonationRow,
  DonationInsert,
  DonationUpdate,
} from './donation.db'

// Donation Report
export type {
  DonationReportRow,
  DonationReportInsert,
  DonationReportUpdate,
} from './donation-report.db'

// Gallery Items
export type {
  GalleryItemsRow,
  GalleryItemsInsert,
  GalleryItemsUpdate,
} from './gallery-items.db'

// Headquarters
export type {
  HeadquartersRow,
  HeadquartersInsert,
  HeadquartersUpdate,
} from './headquarters.db'

// Headquarters Project (junction)
export type {
  HeadquartersProjectRow,
  HeadquartersProjectInsert,
  HeadquartersProjectUpdate,
} from './headquarters-project.db'

// Project
export type {
  ProjectRow,
  ProjectInsert,
  ProjectUpdate,
} from './project.db'

// Role
export type {
  RoleRow,
  RoleInsert,
  RoleUpdate,
} from './role.db'

// Site Contents
export type {
  SiteContentsRow,
  SiteContentsInsert,
  SiteContentsUpdate,
} from './site-contents.db'

// Testimonial
export type {
  TestimonialRow,
  TestimonialInsert,
  TestimonialUpdate,
} from './testimonial.db'

// User
export type {
  UserRow,
  UserInsert,
  UserUpdate,
} from './user.db'

// User Role (junction)
export type {
  UserRoleRow,
  UserRoleInsert,
  UserRoleUpdate,
} from './user-role.db'

// ============================================
// Legacy application types - maintained for compatibility
// ============================================
export type UserRole = "donator" | "director" | "admin" | "director_sede" | "entrenador"

export interface User {
  id: string
  first_name: string | null
  last_name: string | null
  birthdate: string | null
  username: string
  phone: string | null
  email: string
  headquarter_id?: string | null
  profile_images_id?: string | null
  created_at?: string
  updated_at?: string
  roles?: string[] // Array of role_ids from user_role table
}

export interface CreateUserData {
  id: string
  first_name: string
  last_name: string
  birthdate: string
  username: string
  phone?: string
  email: string
  role: UserRole
  headquarter_id?: string | null
}

export interface UpdateUserData {
  first_name?: string
  last_name?: string
  birthdate?: string
  username?: string
  phone?: string
  profile_images_id?: string
  headquarter_id?: string | null
}

// Tipos para jugadores (no autenticados)
export interface Player {
  id: number
  first_name: string
  last_name: string
  birthdate: string
  category: string
  position: string
  jersey_number?: number
  photo_url?: string
  phone?: string
  emergency_contact?: string
  emergency_phone?: string
  sede_id?: string
  active: boolean
  created_at?: string
  updated_at?: string
}

export interface CreatePlayerData {
  first_name: string
  last_name: string
  birthdate: string
  category: string
  position: string
  jersey_number?: number
  photo_url?: string
  phone?: string
  emergency_contact?: string
  emergency_phone?: string
  sede_id?: string
  active?: boolean
}

// Tipos para entrenadores (no autenticados)
export interface Coach {
  id: number
  first_name: string
  last_name: string
  birthdate: string
  specialization: string
  experience_years?: number
  phone: string
  email?: string
  photo_url?: string
  sede_id?: string
  active: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateCoachData {
  first_name: string
  last_name: string
  birthdate: string
  specialization: string
  experience_years?: number
  phone: string
  email?: string
  photo_url?: string
  sede_id?: string
  active?: boolean
}

// Tipo para errores de Supabase
export interface SupabaseError {
  message: string
  details?: string
  hint?: string
  code?: string
}

// Tipo genérico para respuestas de Supabase
export interface SupabaseResponse<T> {
  data: T | null
  error: SupabaseError | null
}
