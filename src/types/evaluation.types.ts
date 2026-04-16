export type EvaluationType = "ANTHROPOMETRIC" | "TECHNICAL" | "EMOTIONAL";

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

export interface EvaluationReport {
  beneficiaryId: string;
  beneficiaryName: string;
  headquarterName: string | null;
  date: string;
  type: EvaluationType;
  questions: Record<string, unknown> | null;
}

export interface EvaluationPanelItem {
  id: string;
  date: string;
  type: EvaluationType;
  score: number;
  notes?: string;
  metrics?: Record<string, number | string>;
  graphMetrics?: Record<string, number | string>;
}

export interface EvaluationPanelProps {
  evaluations: EvaluationPanelItem[];
  emptyLabel: string;
  showGraph?: boolean;
  languageOverride?: "es" | "en";
}

import type { Json } from "@/api/types";

export interface EvaluationPayload {
  type: EvaluationType;
  anthropometric_detail?: Json | null;
  technical_tactic_detail?: Json | null;
  emotional_detail?: Json | null;
}
