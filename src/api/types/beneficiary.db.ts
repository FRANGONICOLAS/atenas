/**
 * Beneficiary table types
 */

import type { Json } from './base.db'

export interface BeneficiaryRow {
  address: string | null
  anthropometric_detail: Json | null
  attendance: number | null
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
  emotional_detail: Json | null
  registry_date: string | null
  sex: string | null
  status: string | null
  technical_tactic_detail: Json | null
}

export interface BeneficiaryInsert {
  address?: string | null
  anthropometric_detail?: Json | null
  attendance?: number | null
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
  emotional_detail?: Json | null
  registry_date?: string | null
  sex?: string | null
  status?: string | null
  technical_tactic_detail?: Json | null
}

export interface BeneficiaryUpdate {
  address?: string | null
  anthropometric_detail?: Json | null
  attendance?: number | null
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
  emotional_detail?: Json | null
  registry_date?: string | null
  status?: string | null
  technical_tactic_detail?: Json | null
}
