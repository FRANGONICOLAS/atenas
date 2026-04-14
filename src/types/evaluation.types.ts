export type EvaluationType = 'ANTHROPOMETRIC' | 'TECHNICAL' | 'EMOTIONAL';

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
  anthropometric_detail?: Json | null;
  technical_tactic_detail?: Json | null;
  emotional_detail?: Json | null;
}