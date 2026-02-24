import { client } from "@/api/supabase/client";
import type { EvaluationRow } from "@/api/types";
import type {
  AntropometricData,
  EmotionalData,
  TechnicalTacticalData,
} from "@/types/beneficiary.types";

interface EvaluationJoinRow {
  beneficiary_id: string | null;
  evaluation: EvaluationRow | null;
  beneficiary: {
    first_name: string | null;
    last_name: string | null;
    headquarters_id: string | null;
  } | null;
}

export const evaluationService = {
  async createForBeneficiary(
    beneficiaryId: string,
    payload: {
      anthropometric_detail?: AntropometricData;
      technical_tactic_detail?: TechnicalTacticalData;
      emotional_detail?: EmotionalData;
    },
  ): Promise<EvaluationRow> {
    const { data, error } = await client
      .from("evaluation")
      .insert([
        {
          anthropometric_detail: payload.anthropometric_detail ?? null,
          technical_tactic_detail: payload.technical_tactic_detail ?? null,
          emotional_detail: payload.emotional_detail ?? null,
        },
      ])
      .select("id, created_at, anthropometric_detail, technical_tactic_detail, emotional_detail")
      .single();

    if (error) throw error;

    const { error: linkError } = await client
      .from("beneficiary's_evaluation")
      .insert([
        {
          beneficiary_id: beneficiaryId,
          evaluation_id: data.id,
        },
      ]);

    if (linkError) throw linkError;

    return data;
  },

  async getByHeadquarterId(headquarterId: string): Promise<EvaluationJoinRow[]> {
    const { data, error } = await client
      .from("beneficiary's_evaluation")
      .select(
        "beneficiary_id, evaluation: evaluation_id (id, created_at, anthropometric_detail, technical_tactic_detail, emotional_detail), beneficiary: beneficiary_id (first_name, last_name, headquarters_id)",
      )
      .eq("beneficiary.headquarters_id", headquarterId)
      .order("evaluation_id", { ascending: false });

    if (error) throw error;
    return (data as EvaluationJoinRow[]) || [];
  },

  async deleteEvaluation(evaluationId: string): Promise<void> {
    const { error: linkError } = await client
      .from("beneficiary's_evaluation")
      .delete()
      .eq("evaluation_id", evaluationId);

    if (linkError) throw linkError;

    const { error } = await client
      .from("evaluation")
      .delete()
      .eq("id", evaluationId);

    if (error) throw error;
  },
};
