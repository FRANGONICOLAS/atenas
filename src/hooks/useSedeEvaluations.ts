import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { evaluationService, headquarterService, userService } from "@/api/services";
import { calculatePerformance } from "@/lib/beneficiaryCalculations";
import { useAuth } from "@/hooks/useAuth";
import type { Evaluation, EvaluationType, TechnicalTacticalData } from "@/types";
import type { EvaluationRow } from "@/api/types";

interface EvaluationJoinRow {
  beneficiary_id: string | null;
  evaluation: EvaluationRow | null;
  beneficiary: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

const resolveEvaluationType = (evaluation: EvaluationRow): EvaluationType => {
  if (evaluation.technical_tactic_detail) return "technical";
  if (evaluation.anthropometric_detail) return "physical";
  if (evaluation.emotional_detail) return "psychological";
  return "technical";
};

const extractObservations = (detail: unknown): string | undefined => {
  if (!detail || typeof detail !== "object") return undefined;
  const value = (detail as Record<string, unknown>).observaciones;
  return typeof value === "string" ? value : undefined;
};

const extractComments = (evaluation: EvaluationRow): string => {
  const emotional = extractObservations(evaluation.emotional_detail);
  const technical = extractObservations(evaluation.technical_tactic_detail);
  return emotional || technical || "";
};

const mapEvaluationRow = (row: EvaluationJoinRow): Evaluation | null => {
  if (!row.evaluation || !row.beneficiary || !row.beneficiary_id) return null;

  const beneficiaryName = `${row.beneficiary.first_name ?? ""} ${row.beneficiary.last_name ?? ""}`.trim();
  const technicalDetail = row.evaluation.technical_tactic_detail as TechnicalTacticalData | null;

  return {
    id: row.evaluation.id,
    beneficiaryId: row.beneficiary_id,
    beneficiaryName: beneficiaryName || "Beneficiario",
    date: row.evaluation.created_at || new Date().toISOString(),
    type: resolveEvaluationType(row.evaluation),
    score: calculatePerformance(technicalDetail),
    comments: extractComments(row.evaluation),
    evaluator: "",
  };
};

export const useSedeEvaluations = () => {
  const { user, isLoading: authLoading } = useAuth();

  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluationSearch, setEvaluationSearch] = useState("");
  const [evaluationTypeFilter, setEvaluationTypeFilter] = useState("all");
  const [assignedHeadquarterId, setAssignedHeadquarterId] = useState<string | null>(null);
  const [assignedHeadquarterName, setAssignedHeadquarterName] = useState<string | null>(null);

  const resolveHeadquarterFromUser = async () => {
    try {
      if (user?.headquarter_id) {
        const hq = await headquarterService.getById(user.headquarter_id);
        return hq ? [hq] : [];
      }

      const dbUser = await userService.getById(user?.id || "");
      if (dbUser?.headquarter_id) {
        const hq = await headquarterService.getById(dbUser.headquarter_id);
        return hq ? [hq] : [];
      }
    } catch (error) {
      console.warn("No se pudo resolver sede desde user.headquarter_id:", error);
    }

    return [];
  };

  const resolveHeadquarterFromMetadata = async () => {
    const meta = user?.user_metadata ?? {};
    const metaId =
      (meta["headquarters_id"] as string | undefined) ||
      (meta["headquarter_id"] as string | undefined) ||
      (meta["sede_id"] as string | undefined) ||
      (meta["sedeId"] as string | undefined);
    const metaName =
      (meta["headquarters_name"] as string | undefined) ||
      (meta["headquarter_name"] as string | undefined) ||
      (meta["sede_name"] as string | undefined) ||
      (meta["sede"] as string | undefined);

    if (metaId) {
      const hq = await headquarterService.getById(metaId);
      return hq ? [hq] : [];
    }

    if (metaName) {
      return await headquarterService.searchByName(metaName);
    }

    return [];
  };

  const loadAssignedHeadquarter = async () => {
    if (!user?.id) {
      setAssignedHeadquarterId(null);
      setAssignedHeadquarterName(null);
      toast.error("Sesion invalida", {
        description: "No se pudo identificar al usuario autenticado.",
      });
      return;
    }

    try {
      let directorHeadquarters = await resolveHeadquarterFromUser();

      if (directorHeadquarters.length === 0) {
        directorHeadquarters = await headquarterService.getByDirectorId(user.id);
      }

      if (directorHeadquarters.length === 0) {
        directorHeadquarters = await resolveHeadquarterFromMetadata();
      }

      if (directorHeadquarters.length === 0) {
        setAssignedHeadquarterId(null);
        setAssignedHeadquarterName(null);
        toast.error("Sede no asignada", {
          description: "No se encontro una sede asociada a este usuario.",
        });
        return;
      }

      const assigned = directorHeadquarters[0];
      setAssignedHeadquarterId(assigned.headquarters_id);
      setAssignedHeadquarterName(assigned.name);
    } catch (error) {
      console.error("Error loading assigned headquarter:", error);
      toast.error("Error al cargar sede", {
        description: "No se pudo obtener la sede asignada.",
      });
    }
  };

  const loadEvaluations = async (headquarterId: string | null) => {
    if (!headquarterId) {
      setEvaluations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await evaluationService.getByHeadquarterId(headquarterId);
      const mapped = (data as EvaluationJoinRow[])
        .map(mapEvaluationRow)
        .filter((item): item is Evaluation => Boolean(item));

      const ordered = mapped.sort((a, b) => b.date.localeCompare(a.date));
      setEvaluations(ordered);
    } catch (error) {
      console.error("Error loading evaluations:", error);
      toast.error("Error al cargar evaluaciones", {
        description: "No se pudieron cargar las evaluaciones de la sede.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    void loadAssignedHeadquarter();
  }, [authLoading, user?.id]);

  useEffect(() => {
    void loadEvaluations(assignedHeadquarterId);
  }, [assignedHeadquarterId]);

  const refresh = async () => {
    await loadEvaluations(assignedHeadquarterId);
  };

  const handleDeleteEvaluation = async (evaluationId: string) => {
    try {
      await evaluationService.deleteEvaluation(evaluationId);
      await loadEvaluations(assignedHeadquarterId);
      toast.success("Evaluacion eliminada");
    } catch (error) {
      console.error("Error deleting evaluation:", error);
      toast.error("Error al eliminar evaluacion");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getEvaluationTypeLabel = (type: EvaluationType) => {
    const labels = {
      physical: "Fisica",
      technical: "Tecnica",
      tactical: "Tactica",
      psychological: "Psicologica",
    };
    return labels[type];
  };

  return {
    evaluations,
    loading,
    evaluationSearch,
    setEvaluationSearch,
    evaluationTypeFilter,
    setEvaluationTypeFilter,
    assignedHeadquarterId,
    assignedHeadquarterName,
    refresh,
    handleDeleteEvaluation,
    formatDate,
    getEvaluationTypeLabel,
  };
};
