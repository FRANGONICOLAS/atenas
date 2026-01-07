export type EvaluationType = 'physical' | 'technical' | 'tactical' | 'psychological';

export interface Evaluation {
  id: number;
  beneficiaryId: number;
  beneficiaryName: string;
  date: string;
  type: EvaluationType;
  score: number;
  comments: string;
  evaluator: string;
}
