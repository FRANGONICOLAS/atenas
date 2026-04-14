/**
 * Evaluation table types
 */

import type { Json } from './base.db'

export interface EvaluationRow {
  id: string
  created_at: string | null
  type: 'ANTHROPOMETRIC' | 'TECHNICAL' | 'EMOTIONAL' | null
  anthropometric_detail: Json | null
  technical_tactic_detail: Json | null
  emotional_detail: Json | null
}

export interface EvaluationInsert {
  id?: string
  created_at?: string | null
  type?: 'ANTHROPOMETRIC' | 'TECHNICAL' | 'EMOTIONAL' | null
  anthropometric_detail?: Json | null
  technical_tactic_detail?: Json | null
  emotional_detail?: Json | null
}

export interface EvaluationUpdate {
  id?: string
  created_at?: string | null
  type?: 'ANTHROPOMETRIC' | 'TECHNICAL' | 'EMOTIONAL' | null
  anthropometric_detail?: Json | null
  technical_tactic_detail?: Json | null
  emotional_detail?: Json | null
}
