/**
 * Beneficiary table types
 */

export interface BeneficiaryRow {
  address: string | null
  beneficiary_id: string
  birth_date: string | null
  category: string | null
  created_at: string | null
  emergency_contact: string | null
  first_name: string
  guardian: string | null
  headquarters_id: string
  last_name: string
  medical_info: string | null
  observation: string | null
  performance: number | null
  phone: string | null
  photo_url: string | null
  registry_date: string | null
  sex: string | null
  status: string | null
}

export interface BeneficiaryInsert {
  address?: string | null
  beneficiary_id?: string
  birth_date?: string | null
  category?: string | null
  created_at?: string | null
  emergency_contact?: string | null
  first_name: string
  guardian?: string | null
  headquarters_id: string
  last_name: string
  medical_info?: string | null
  observation?: string | null
  performance?: number | null
  phone?: string | null
  photo_url?: string | null
  registry_date?: string | null
  sex?: string | null
  status?: string | null
}

export interface BeneficiaryUpdate {
  address?: string | null
  beneficiary_id?: string
  birth_date?: string | null
  category?: string | null
  created_at?: string | null
  emergency_contact?: string | null
  first_name?: string
  guardian?: string | null
  headquarters_id?: string
  last_name?: string
  medical_info?: string | null
  observation?: string | null
  performance?: number | null
  phone?: string | null
  photo_url?: string | null
  registry_date?: string | null
  status?: string | null
}
