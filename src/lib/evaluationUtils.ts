import type { Json, EvaluationRow } from "@/api/types";
import type { Evaluation, EvaluationType, EvaluationReport } from "@/types";
import { getEvaluationScore } from "@/lib/beneficiaryCalculations";

export interface EvaluationJoinRow {
  beneficiary_id: string | null;
  evaluation: EvaluationRow | null;
  beneficiary: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export const resolveEvaluationType = (
  evaluation: EvaluationRow,
): EvaluationType => {
  return normalizeEvaluationType(evaluation.type) ?? "EMOTIONAL";
};

export const extractComments = (evaluation: EvaluationRow): string => {
  return getEvaluationComment(evaluation);
};

export const mapEvaluationRow = (row: EvaluationJoinRow): Evaluation | null => {
  if (!row.evaluation || !row.beneficiary || !row.beneficiary_id) return null;

  const beneficiaryName =
    `${row.beneficiary.first_name ?? ""} ${row.beneficiary.last_name ?? ""}`.trim();

  return {
    id: row.evaluation.id,
    beneficiaryId: row.beneficiary_id,
    beneficiaryName: beneficiaryName || "Beneficiario",
    date: row.evaluation.created_at || new Date().toISOString(),
    type: resolveEvaluationType(row.evaluation),
    score: getEvaluationScore(row.evaluation),
    comments: extractComments(row.evaluation),
    evaluator: "",
  };
};

export const mapEvaluationReport = (
  row: EvaluationJoinRow,
  headquarterName: string | null,
): EvaluationReport | null => {
  if (!row.evaluation || !row.beneficiary || !row.beneficiary_id) return null;

  const beneficiaryName =
    `${row.beneficiary.first_name ?? ""} ${row.beneficiary.last_name ?? ""}`.trim();
  const type = normalizeEvaluationType(row.evaluation.type) ?? "EMOTIONAL";

  return {
    beneficiaryId: row.beneficiary_id,
    beneficiaryName: beneficiaryName || "Beneficiario",
    headquarterName,
    date: row.evaluation.created_at || new Date().toISOString(),
    type,
    questions: getEvaluationDetailByType(row.evaluation),
  };
};

export const evaluationTypeLabels: Record<EvaluationType, string> = {
  ANTHROPOMETRIC: "Antropométrica",
  TECHNICAL: "Técnico-Táctica",
  EMOTIONAL: "Emocional",
};

export const evaluationDetailFieldByType: Record<
  EvaluationType,
  "anthropometric_detail" | "technical_tactic_detail" | "emotional_detail"
> = {
  ANTHROPOMETRIC: "anthropometric_detail",
  TECHNICAL: "technical_tactic_detail",
  EMOTIONAL: "emotional_detail",
};

export const normalizeEvaluationType = (
  type?: string | null,
): EvaluationType | null => {
  switch ((type ?? "").toUpperCase()) {
    case "ANTHROPOMETRIC":
      return "ANTHROPOMETRIC";
    case "TECHNICAL":
    case "TECHNICAL_TACTIC":
      return "TECHNICAL";
    case "EMOTIONAL":
    case "PSYCHOLOGICAL_EMOTIONAL":
      return "EMOTIONAL";
    default:
      return null;
  }
};

const hasMeaningfulValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
};

export const hasEvaluationDetail = (detail?: Json | null): boolean => {
  if (!detail || typeof detail !== "object" || Array.isArray(detail)) {
    return false;
  }

  return Object.values(detail).some(hasMeaningfulValue);
};

const parseEvaluationDetail = (rawDetail?: Json | null) => {
  if (rawDetail === null || rawDetail === undefined) {
    return null;
  }

  if (typeof rawDetail === "string") {
    try {
      const parsed = JSON.parse(rawDetail);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : null;
    } catch {
      return null;
    }
  }

  if (typeof rawDetail === "object" && !Array.isArray(rawDetail)) {
    return rawDetail;
  }

  return null;
};

export const getEvaluationDetailByType = (
  evaluation: Pick<
    EvaluationRow,
    | "type"
    | "anthropometric_detail"
    | "technical_tactic_detail"
    | "emotional_detail"
  >,
) => {
  const normalizedType = normalizeEvaluationType(evaluation.type);
  if (!normalizedType) return null;

  const field = evaluationDetailFieldByType[normalizedType];
  return parseEvaluationDetail(evaluation[field]);
};

export const getEvaluationComment = (
  evaluation: Pick<
    EvaluationRow,
    | "type"
    | "anthropometric_detail"
    | "technical_tactic_detail"
    | "emotional_detail"
  >,
): string => {
  const detail = getEvaluationDetailByType(evaluation);
  if (!detail || typeof detail !== "object" || Array.isArray(detail)) {
    return "";
  }

  const record = detail as Record<string, unknown>;
  const comment =
    record.observaciones ??
    record.observation ??
    record.observacion ??
    record.comentarios;

  return typeof comment === "string" ? comment : "";
};

export const buildEvaluationInsertPayload = (payload: {
  type: EvaluationType;
  anthropometric_detail?: Json | null;
  technical_tactic_detail?: Json | null;
  emotional_detail?: Json | null;
}) => ({
  type: payload.type,
  anthropometric_detail:
    payload.type === "ANTHROPOMETRIC"
      ? (payload.anthropometric_detail ?? null)
      : null,
  technical_tactic_detail:
    payload.type === "TECHNICAL"
      ? (payload.technical_tactic_detail ?? null)
      : null,
  emotional_detail:
    payload.type === "EMOTIONAL" ? (payload.emotional_detail ?? null) : null,
});
