export type UserRole = "DONATOR" | "DIRECTOR" | "ADMIN" | "DIRECTOR_SEDE";

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  birthdate: string;
  username: string;
  phone: string;
  email: string;
  role: UserRole;
  profile_images_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserData {
  id: string;
  first_name: string;
  last_name: string;
  birthdate: string;
  username: string;
  phone?: string;
  email: string;
  role: UserRole;
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  birthdate?: string;
  username?: string;
  phone?: string;
  profile_images_id?: string;
}

// Tipos para jugadores (no autenticados)
export interface Player {
  id: number;
  first_name: string;
  last_name: string;
  birthdate: string;
  category: string;
  position: string;
  jersey_number?: number;
  photo_url?: string;
  phone?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  sede_id?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePlayerData {
  first_name: string;
  last_name: string;
  birthdate: string;
  category: string;
  position: string;
  jersey_number?: number;
  photo_url?: string;
  phone?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  sede_id?: string;
  active?: boolean;
}

// Tipos para entrenadores (no autenticados)
export interface Coach {
  id: number;
  first_name: string;
  last_name: string;
  birthdate: string;
  specialization: string;
  experience_years?: number;
  phone: string;
  email?: string;
  photo_url?: string;
  sede_id?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCoachData {
  first_name: string;
  last_name: string;
  birthdate: string;
  specialization: string;
  experience_years?: number;
  phone: string;
  email?: string;
  photo_url?: string;
  sede_id?: string;
  active?: boolean;
}

// Tipo para errores de Supabase
export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// Tipo genérico para respuestas de Supabase
export interface SupabaseResponse<T> {
  data: T | null;
  error: SupabaseError | null;
}
