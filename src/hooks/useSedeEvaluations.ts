import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  evaluationService,
  headquarterService,
  userService,
} from "@/api/services";
import { generateEvaluationsPDF } from "@/lib/reportGenerator";
import { useAuth } from "@/hooks/useAuth";
import type { Evaluation, EvaluationType, EvaluationReport } from "@/types";
import {
  evaluationTypeLabels,
  normalizeEvaluationType,
  mapEvaluationRow,
  mapEvaluationReport,
  EvaluationJoinRow,
} from "@/lib/evaluationUtils";
import { buildDateRange, isEvaluationInRange } from "@/lib/dateRangeUtils";
import { getHeadquarterDirectorLabel } from "@/lib/userUtils";
import {
  getFantasticLetterTabs,
  getAnthropometricEvaluationTabs,
  getTechnicalEvaluationTabs,
} from "@/lib/evaluationDisplayUtils";

// Re-exports for backward compatibility
export { getFantasticLetterTabs, getAnthropometricEvaluationTabs, getTechnicalEvaluationTabs } from "@/lib/evaluationDisplayUtils";
export type {
  FantasticQuestionItem,
  FantasticLetterTab,
  TechnicalMetricItem,
  TechnicalEvaluationTab,
  AnthropometricMetricItem,
  AnthropometricEvaluationTab,
} from "@/lib/evaluationDisplayUtils";

export const useSedeEvaluations = () => {
  const { user, isLoading: authLoading } = useAuth();

  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluationSearch, setEvaluationSearch] = useState("");
  const [evaluationTypeFilter, setEvaluationTypeFilter] = useState("all");
  const [assignedHeadquarterId, setAssignedHeadquarterId] = useState<
    string | null
  >(null);
  const [assignedHeadquarterName, setAssignedHeadquarterName] = useState<
    string | null
  >(null);

  const resolveHeadquarterFromUser = useCallback(async () => {
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
      console.warn(
        "No se pudo resolver sede desde user.headquarter_id:",
        error,
      );
    }

    return [];
  }, [user?.headquarter_id, user?.id]);

  const resolveHeadquarterFromMetadata = useCallback(async () => {
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
  }, [user?.user_metadata]);

  const loadAssignedHeadquarter = useCallback(async () => {
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
        directorHeadquarters = await headquarterService.getByDirectorId(
          user.id,
        );
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
      toast.error("Error al cargar sede", {
        description: "No se pudo obtener la sede asignada.",
      });
    }
  }, [resolveHeadquarterFromMetadata, resolveHeadquarterFromUser, user?.id]);

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
  }, [authLoading, user?.id, loadAssignedHeadquarter]);

  useEffect(() => {
    void loadEvaluations(assignedHeadquarterId);
  }, [assignedHeadquarterId]);

  const refresh = async () => {
    await loadEvaluations(assignedHeadquarterId);
  };

  const exportWithGuard = useCallback(
    async (
      fileName: string,
      getReports: () => Promise<EvaluationReport[]>,
      emptyMessage?: { title: string; description: string },
    ) => {
      if (!assignedHeadquarterId) {
        toast.error("No se pudo exportar", {
          description: "No hay sede asignada para generar el reporte.",
        });
        return;
      }

      try {
        const reports = await getReports();
        if (reports.length === 0) {
          toast.error(emptyMessage?.title ?? "No hay datos para exportar", {
            description:
              emptyMessage?.description ?? "No se encontraron evaluaciones.",
          });
          return;
        }

        generateEvaluationsPDF(reports, fileName, {
          generatedBy: getHeadquarterDirectorLabel(user),
          headquartersName: assignedHeadquarterName ?? undefined,
        });

        toast.success("Reporte generado", {
          description: `Se descargó el reporte con ${reports.length} evaluación(es).`,
        });
      } catch {
        toast.error("Error al generar reporte", {
          description:
            "No se pudo generar el reporte de evaluaciones. Intente de nuevo.",
        });
      }
    },
    [assignedHeadquarterId, assignedHeadquarterName, user],
  );

  const exportEvaluationsByType = useCallback(
    async (
      type: EvaluationType,
      period: "day" | "week" | "month",
      referenceDate: Date | undefined,
      beneficiaryId?: string,
    ) => {
      await exportWithGuard(
        `evaluaciones_${type.toLowerCase()}_${period}`,
        async () => {
          const rawRows = await evaluationService.getByHeadquarterId(
            assignedHeadquarterId!,
          );
          const { start, end } = buildDateRange(
            period,
            referenceDate ?? new Date(),
          );
          return rawRows
            .filter(
              (row) =>
                normalizeEvaluationType(row.evaluation?.type) === type,
            )
            .filter((row) => {
              if (beneficiaryId) {
                return row.beneficiary_id === beneficiaryId;
              }
              return true;
            })
            .filter((row) =>
              isEvaluationInRange(row.evaluation?.created_at, { start, end }),
            )
            .map((row) =>
              mapEvaluationReport(row, assignedHeadquarterName ?? null),
            )
            .filter((item): item is EvaluationReport => Boolean(item));
        },
        {
          title: "No hay evaluaciones para este tipo",
          description: `No se encontraron evaluaciones de tipo ${type} para el período seleccionado.`,
        },
      );
    },
    [assignedHeadquarterId, assignedHeadquarterName, exportWithGuard],
  );

  const exportEvaluationsByBeneficiary = useCallback(
    async (
      beneficiaryId: string,
      period: "day" | "week" | "month",
      referenceDate: Date | undefined,
    ) => {
      await exportWithGuard(
        `evaluaciones_beneficiario_${beneficiaryId}`,
        async () => {
          const rawRows = await evaluationService.getByHeadquarterId(
            assignedHeadquarterId!,
          );
          return rawRows
            .filter((row) => row.beneficiary_id === beneficiaryId)
            .map((row) =>
              mapEvaluationReport(row, assignedHeadquarterName ?? null),
            )
            .filter((item): item is EvaluationReport => Boolean(item));
        },
        {
          title: "No hay evaluaciones para el beneficiario",
          description: "No se encontraron evaluaciones para el beneficiario.",
        },
      );
    },
    [assignedHeadquarterId, assignedHeadquarterName, exportWithGuard],
  );

  const exportEvaluationById = useCallback(
    async (evaluationId: string) => {
      await exportWithGuard(
        `evaluacion_${evaluationId}`,
        async () => {
          const rawRow = await evaluationService.getDetail(evaluationId);
          const report = mapEvaluationReport(
            rawRow,
            assignedHeadquarterName ?? null,
          );
          return report ? [report] : [];
        },
        {
          title: "No hay evaluaciones para el identificador",
          description:
            "No se pudo encontrar la evaluación solicitada para exportar.",
        },
      );
    },
    [assignedHeadquarterName, exportWithGuard],
  );

  const exportAllEvaluations = useCallback(
    async (
      period: "day" | "week" | "month",
      referenceDate: Date | undefined,
    ) => {
      await exportWithGuard(
        `evaluaciones_todas_${period}`,
        async () => {
          const rawRows = await evaluationService.getByHeadquarterId(
            assignedHeadquarterId!,
          );
          const { start, end } = buildDateRange(
            period,
            referenceDate ?? new Date(),
          );
          return rawRows
            .filter((row) =>
              isEvaluationInRange(row.evaluation?.created_at, { start, end }),
            )
            .map((row) =>
              mapEvaluationReport(row, assignedHeadquarterName ?? null),
            )
            .filter((item): item is EvaluationReport => Boolean(item));
        },
        {
          title: "No hay evaluaciones",
          description:
            "No se encontraron evaluaciones para el período seleccionado.",
        },
      );
    },
    [assignedHeadquarterId, assignedHeadquarterName, exportWithGuard],
  );

  const handleDeleteEvaluation = async (evaluationId: string) => {
    try {
      await evaluationService.deleteEvaluation(evaluationId);
      await loadEvaluations(assignedHeadquarterId);
      toast.success("Evaluacion eliminada");
    } catch (error) {
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

  const getEvaluationTypeLabel = (type: string) => {
    const normalized =
      normalizeEvaluationType(type) ?? (type.toUpperCase() as EvaluationType);
    const labels: Record<EvaluationType, string> = {
      ANTHROPOMETRIC: "Antropométrica",
      TECHNICAL: "Técnico‑Táctica",
      EMOTIONAL: "Emocional",
    };

    return labels[normalized] || evaluationTypeLabels[normalized] || type;
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
    exportEvaluationsByType,
    exportEvaluationsByBeneficiary,
    exportEvaluationById,
    exportAllEvaluations,
    formatDate,
    getEvaluationTypeLabel,
    getFantasticLetterTabs,
  };
};
