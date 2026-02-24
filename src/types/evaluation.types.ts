export type EvaluationType = 'physical' | 'technical' | 'tactical' | 'psychological';

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
