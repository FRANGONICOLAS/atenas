/**
 * Beneficiary evaluation junction table types
 */

export interface BeneficiaryEvaluationRow {
  id: number
  created_at: string | null
  beneficiary_id: string | null
  evaluation_id: string | null
}

export interface BeneficiaryEvaluationInsert {
  id?: number
  created_at?: string | null
  beneficiary_id?: string | null
  evaluation_id?: string | null
}

export interface BeneficiaryEvaluationUpdate {
  id?: number
  created_at?: string | null
  beneficiary_id?: string | null
  evaluation_id?: string | null
}
