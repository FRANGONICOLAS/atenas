import { client } from "@/api/supabase/client";
import type { EvaluationRow } from "@/api/types";
import type { EvaluationPayload } from "@/types";

interface EvaluationJoinRow {
  beneficiary_id: string | null;
  evaluation: EvaluationRow | null;
  beneficiary: {
    first_name: string | null;
    last_name: string | null;
    headquarters_id: string | null;
  } | null;
}

interface EvaluationDetailRow {
  beneficiary_id: string | null;
  evaluation: EvaluationRow | null;
  beneficiary: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export const evaluationService = {
  async getById(evaluationId: string): Promise<EvaluationRow> {
    const { data, error } = await client
      .from("evaluation")
      .select("id, created_at, type, questions_answers")
      .eq("id", evaluationId)
      .single();

    if (error) throw error;
    return data;
  },

  async getDetail(evaluationId: string): Promise<EvaluationDetailRow> {
    const { data, error } = await client
      .from("beneficiary's_evaluation")
      .select(
        "beneficiary_id, evaluation: evaluation_id (id, created_at, type, questions_answers), beneficiary: beneficiary_id (first_name, last_name)",
      )
      .eq("evaluation_id", evaluationId)
      .single();

    if (error) throw error;
    return data as EvaluationDetailRow;
  },

  async createForBeneficiary(
    beneficiaryId: string,
    payload: EvaluationPayload,
  ): Promise<EvaluationRow> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (client.from("evaluation") as any)
      .insert([
        {
          type: payload.type,
          questions_answers: payload.questions_answers ?? null,
        },
      ])
      .select("id, created_at, type, questions_answers")
      .single();

    if (error) throw error;
    if (!data) throw new Error("Failed to create evaluation");

    const { error: linkError } = await (client.from("beneficiary's_evaluation"))
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
        "beneficiary_id, evaluation: evaluation_id (id, created_at, type, questions_answers), beneficiary: beneficiary_id (first_name, last_name, headquarters_id)",
      )
      .eq("beneficiary.headquarters_id", headquarterId)
      .order("evaluation_id", { ascending: false });

    if (error) throw error;
    return (data as EvaluationJoinRow[]) || [];
  },

  async getByBeneficiaryId(beneficiaryId: string): Promise<EvaluationJoinRow[]> {
    const { data, error } = await client
      .from("beneficiary's_evaluation")
      .select(
        "beneficiary_id, evaluation: evaluation_id (id, created_at, type, questions_answers)"
      )
      .eq("beneficiary_id", beneficiaryId);

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

  async updateEvaluation(
    evaluationId: string,
    payload: EvaluationPayload,
  ): Promise<EvaluationRow> {
    const { data, error } = await client
      .from("evaluation")
      .update({
        type: payload.type,
        questions_answers: payload.questions_answers ?? null,
      })
      .eq("id", evaluationId)
      .select("id, created_at, type, questions_answers")
      .single();

    if (error) throw error;
    return data;
  },
};
