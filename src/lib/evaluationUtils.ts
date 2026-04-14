import type { Json, EvaluationRow } from "@/api/types";
import type { EvaluationType } from "@/types";

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
  return evaluation[field] ?? null;
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
    record.observaciones ?? record.observation ?? record.observacion ?? record.comentarios;

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
      ? payload.anthropometric_detail ?? null
      : null,
  technical_tactic_detail:
    payload.type === "TECHNICAL"
      ? payload.technical_tactic_detail ?? null
      : null,
  emotional_detail:
    payload.type === "EMOTIONAL" ? payload.emotional_detail ?? null : null,
});