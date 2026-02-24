/**
 * Evaluation table types
 */

import type { Json } from './base.db'

export interface EvaluationRow {
  id: string
  created_at: string | null
  type: 'anthropometric' | 'technical_tactic' | 'psychological_emotional'
  questions_answers: Json | null
}

export interface EvaluationInsert {
  id?: string
  created_at?: string | null
  type: 'anthropometric' | 'technical_tactic' | 'psychological_emotional'
  questions_answers?: Json | null
}

export interface EvaluationUpdate {
  id?: string
  created_at?: string | null
  type?: 'anthropometric' | 'technical_tactic' | 'psychological_emotional'
  questions_answers?: Json | null
}
