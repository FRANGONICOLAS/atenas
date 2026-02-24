export type EvaluationType = 'anthropometric' | 'technical_tactic' | 'psychological_emotional';

export interface Evaluation {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  date: string;
  type: EvaluationType;
  score: number;
  comments: string;
  evaluator: string;
}

import type { Json } from "@/api/types";

export interface EvaluationPayload {
  type: EvaluationType;
  questions_answers?: Json | null;
}