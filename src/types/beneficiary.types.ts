// Categorías de beneficiarios
export type BeneficiaryCategory =
  | "Categoría 1"
  | "Categoría 2"
  | "Categoría 3"
  | "Categoría 4"
  | "Categoría 5";

// Estados de beneficiarios
export type BeneficiaryStatus =
  | "activo"
  | "inactivo"
  | "pendiente"
  | "suspendido";

// Interfaz principal de beneficiario basada en la estructura de la base de datos
export interface Beneficiary {
  idx?: number;
  beneficiary_id: string;
  headquarters_id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  category: BeneficiaryCategory | string;
  phone: string;
  registry_date: string;
  status?: BeneficiaryStatus | string;
  performance?: number; // Rendimiento (%)
  attendance?: number; // Asistencia (%)
  guardian?: string; // Acudiente
  address?: string; // Dirección
  emergency_contact?: string; // Contacto de emergencia
  medical_info?: string; // Información médica
  photo_url?: string | null; // Foto de perfil
  created_at?: string;
  updated_at?: string;
}

// Datos para crear un beneficiario
export interface CreateBeneficiaryData {
  headquarters_id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  category: BeneficiaryCategory | string;
  phone: string;
  registry_date?: string;
  status?: BeneficiaryStatus | string;
  performance?: number;
  attendance?: number;
  guardian?: string;
  photo_url?: string | null;
  address?: string;
  emergency_contact?: string;
  medical_info?: string;
}

// Datos para actualizar un beneficiario
export interface UpdateBeneficiaryData {
  headquarters_id?: string;
  first_name?: string;
  last_name?: string;
  birth_date?: string;
  category?: BeneficiaryCategory | string;
  phone?: string;
  registry_date?: string;
  status?: BeneficiaryStatus | string;
  performance?: number;
  attendance?: number;
  guardian?: string;
  photo_url?: string | null;
  address?: string;
  emergency_contact?: string;
  medical_info?: string;
}

// Interfaz para reportes (mantiene compatibilidad con código existente)
export interface BeneficiaryReport {
  beneficiary_id: string;
  first_name: string;
  last_name: string;
  age?: number;
  category: string;
  headquarters_id: string;
  phone: string;
  registry_date: string;
  status?: string;
  performance?: number;
  attendance?: number;
}

// Interfaz para estadísticas por sede
export interface SedeStats {
  name: string;
  total: number;
  active: number;
  avgPerf: number;
}
