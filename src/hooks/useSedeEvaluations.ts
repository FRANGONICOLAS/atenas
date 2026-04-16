import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  evaluationService,
  headquarterService,
  userService,
} from "@/api/services";
import { getEvaluationScore } from "@/lib/beneficiaryCalculations";
import { generateEvaluationsPDF } from "@/lib/reportGenerator";
import { useAuth } from "@/hooks/useAuth";
import type { Evaluation, EvaluationType, EvaluationReport } from "@/types";
import type { EvaluationRow } from "@/api/types";
import {
  getEvaluationComment,
  evaluationTypeLabels,
  normalizeEvaluationType,
  getEvaluationDetailByType,
} from "@/lib/evaluationUtils";

interface EvaluationJoinRow {
  beneficiary_id: string | null;
  evaluation: EvaluationRow | null;
  beneficiary: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

const resolveEvaluationType = (evaluation: EvaluationRow): EvaluationType => {
  return normalizeEvaluationType(evaluation.type) ?? "EMOTIONAL";
};

const extractComments = (evaluation: EvaluationRow): string => {
  return getEvaluationComment(evaluation);
};

const mapEvaluationRow = (row: EvaluationJoinRow): Evaluation | null => {
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

export interface FantasticQuestionItem {
  key: string;
  question: string;
  answer: string;
  score?: string;
}

export interface FantasticLetterTab {
  id: string;
  label: string;
  title: string;
  questions: FantasticQuestionItem[];
}

const fantasticLetterDefinition = [
  { id: "F", label: "F", title: "F - Familia y Amigos", min: 1, max: 5 },
  { id: "A1", label: "A", title: "A - Actividad Física", min: 6, max: 10 },
  { id: "N", label: "N", title: "N - Nutrición", min: 11, max: 15 },
  { id: "T1", label: "T", title: "T - Tabaco y Tóxicos", min: 16, max: 20 },
  { id: "A2", label: "A", title: "A - Alcohol", min: 21, max: 25 },
  { id: "S", label: "S", title: "S - Sueño y Estrés", min: 26, max: 30 },
  {
    id: "T2",
    label: "T",
    title: "T - Trabajo y Personalidad",
    min: 31,
    max: 35,
  },
  { id: "I", label: "I", title: "I - Introspección", min: 36, max: 40 },
  {
    id: "C",
    label: "C",
    title: "C - Conducción y Comportamiento Social",
    min: 41,
    max: 45,
  },
];

const formatDetailValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  if (typeof value === "boolean") {
    return value ? "Sí" : "No";
  }

  if (Array.isArray(value)) {
    return value.length === 0 ? "N/A" : value.join(", ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 0);
  }

  return String(value);
};

export const getFantasticLetterTabs = (
  detail?: Record<string, unknown>,
): FantasticLetterTab[] => {
  if (!detail || typeof detail !== "object" || Array.isArray(detail)) {
    return [];
  }

  const entries = Object.entries(detail)
    .filter(
      ([, value]) =>
        typeof value === "object" && value !== null && !Array.isArray(value),
    )
    .map(([key, value]) => ({
      key,
      number: Number((key.match(/(\d+)$/) ?? [])[0] ?? "0"),
      payload: value as Record<string, unknown>,
    }))
    .sort((a, b) => a.number - b.number);

  return fantasticLetterDefinition
    .map((group) => ({
      id: group.id,
      label: group.label,
      title: group.title,
      questions: entries
        .filter(
          (entry) => entry.number >= group.min && entry.number <= group.max,
        )
        .map((entry) => ({
          key: entry.key,
          question: String(
            entry.payload.question ?? entry.payload.pregunta ?? "",
          ),
          answer: String(
            entry.payload.answer ??
              entry.payload.respuesta ??
              formatDetailValue(entry.payload.value),
          ),
          score: formatDetailValue(entry.payload.value),
        })),
    }))
    .filter((group) => group.questions.length > 0);
};

export interface TechnicalMetricItem {
  key: string;
  label: string;
  value: string;
}

export interface TechnicalEvaluationTab {
  id: string;
  label: string;
  title: string;
  metrics: TechnicalMetricItem[];
}

export interface AnthropometricMetricItem {
  key: string;
  label: string;
  value: string;
}

export interface AnthropometricEvaluationTab {
  id: string;
  label: string;
  title: string;
  metrics: AnthropometricMetricItem[];
}

const formatTechnicalLabel = (value: string) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const anthropometricFieldLabels: Record<string, string> = {
  genero: "Género",
  peso: "Peso (kg)",
  talla: "Talla (cm)",
  imc: "IMC",
  perimetro_cintura: "Perímetro Cintura",
  perimetro_cadera: "Perímetro Cadera",
  relacion_cintura_cadera: "Relación Cintura/Cadera",
  perimetro_brazo: "Perímetro Brazo",
  perimetro_muslo: "Perímetro Muslo",
  perimetro_pantorrilla: "Perímetro Pantorrilla",
  pliegue_tricipital: "Pliegue Tricipital",
  pliegue_bicipital: "Pliegue Bicipital",
  pliegue_subescapular: "Pliegue Subescapular",
  pliegue_suprailiaco: "Pliegue Suprailiaco",
  pliegue_abdominal: "Pliegue Abdominal",
  pliegue_muslo: "Pliegue Muslo",
  pliegue_pantorrilla: "Pliegue Pantorrilla",
  biacromial: "Biacromial",
  bicrestal: "Bicrestal",
  biepicondilar_humero: "Biepicondilar Húmero",
  biepicondilar_femur: "Biepicondilar Fémur",
  biestiloideo_muneca: "Biestiloideo Muñeca",
  bitrocantereo: "Bitrocantéreo",
  porcentaje_grasa: "Porcentaje de Grasa",
  masa_magra: "Masa Magra",
  masa_osea: "Masa Ósea",
  endomorfina: "Endomorfina",
  mesomorfina: "Mesomorfina",
  ectomorfina: "Ectomorfina",
};

const anthropometricSections = [
  {
    id: "medidas",
    label: "Medidas",
    title: "Medidas Antropométricas",
    fields: [
      "genero",
      "peso",
      "talla",
      "imc",
      "perimetro_cintura",
      "perimetro_cadera",
      "relacion_cintura_cadera",
      "perimetro_brazo",
      "perimetro_muslo",
      "perimetro_pantorrilla",
    ],
  },
  {
    id: "pliegues",
    label: "Pliegues",
    title: "Pliegues Cutáneos",
    fields: [
      "pliegue_tricipital",
      "pliegue_bicipital",
      "pliegue_subescapular",
      "pliegue_suprailiaco",
      "pliegue_abdominal",
      "pliegue_muslo",
      "pliegue_pantorrilla",
    ],
  },
  {
    id: "diametros",
    label: "Diámetros",
    title: "Diámetros Óseos",
    fields: [
      "biacromial",
      "bicrestal",
      "biepicondilar_humero",
      "biepicondilar_femur",
      "biestiloideo_muneca",
      "bitrocantereo",
    ],
  },
  {
    id: "composicion",
    label: "Composición",
    title: "Composición Corporal Estimada",
    fields: ["porcentaje_grasa", "masa_magra", "masa_osea"],
  },
  {
    id: "somatotipo",
    label: "Somatotipo",
    title: "Evaluación del Somatotipo",
    fields: ["endomorfina", "mesomorfina", "ectomorfina"],
  },
];

export const getAnthropometricEvaluationTabs = (
  detail?: Record<string, unknown>,
): AnthropometricEvaluationTab[] => {
  if (!detail || typeof detail !== "object" || Array.isArray(detail)) {
    return [];
  }

  return anthropometricSections
    .map((section) => ({
      id: section.id,
      label: section.label,
      title: section.title,
      metrics: section.fields.map((field) => ({
        key: field,
        label: anthropometricFieldLabels[field] ?? formatTechnicalLabel(field),
        value: formatDetailValue(detail[field]),
      })),
    }))
    .filter((section) =>
      section.metrics.some((metric) => metric.value !== "N/A"),
    );
};

export const getTechnicalEvaluationTabs = (
  detail?: Record<string, unknown>,
): TechnicalEvaluationTab[] => {
  if (!detail || typeof detail !== "object" || Array.isArray(detail)) {
    return [];
  }

  return Object.entries(detail)
    .filter(
      ([, value]) =>
        typeof value === "object" && value !== null && !Array.isArray(value),
    )
    .map(([categoryKey, categoryValue]) => ({
      id: categoryKey,
      label: formatTechnicalLabel(categoryKey),
      title: formatTechnicalLabel(categoryKey),
      metrics: Object.entries(categoryValue as Record<string, unknown>).map(
        ([metricKey, metricValue]) => ({
          key: metricKey,
          label: formatTechnicalLabel(metricKey),
          value: formatDetailValue(metricValue),
        }),
      ),
    }));
};

const mapEvaluationReport = (
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

const buildDateRange = (
  period: "day" | "week" | "month",
  referenceDate: Date,
) => {
  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);

  if (period === "day") {
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (period === "week") {
    const day = start.getDay();
    const offset = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - offset);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  const monthStart = new Date(start);
  monthStart.setDate(1);
  const monthEnd = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );
  return { start: monthStart, end: monthEnd };
};

const isEvaluationInRange = (
  dateString: string | null | undefined,
  range: { start: Date; end: Date },
) => {
  if (!dateString) return false;
  const value = new Date(dateString);
  return (
    !Number.isNaN(value.getTime()) && value >= range.start && value <= range.end
  );
};

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
      console.error("Error loading assigned headquarter:", error);
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
  }, [authLoading, user?.id, loadAssignedHeadquarter]);

  useEffect(() => {
    void loadEvaluations(assignedHeadquarterId);
  }, [assignedHeadquarterId]);

  const refresh = async () => {
    await loadEvaluations(assignedHeadquarterId);
  };

  const getHeadquarterDirectorLabel = (): string => {
    const fullName =
      `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();
    return fullName ? `Director de sede: ${fullName}` : "Director de sede";
  };

  const exportEvaluationsByType = async (
    type: EvaluationType,
    period: "day" | "week" | "month",
    referenceDate: Date | undefined,
    beneficiaryId?: string,
  ) => {
    if (!assignedHeadquarterId) {
      toast.error("No se pudo exportar", {
        description: "No hay sede asignada para generar el reporte.",
      });
      return;
    }

    const dateRange = buildDateRange(period, referenceDate ?? new Date());

    try {
      const rawRows = await evaluationService.getByHeadquarterId(
        assignedHeadquarterId,
      );

      const reports = rawRows
        .filter((row) => normalizeEvaluationType(row.evaluation?.type) === type)
        .filter((row) => {
          if (beneficiaryId) {
            return row.beneficiary_id === beneficiaryId;
          }
          return true;
        })
        .filter((row) =>
          isEvaluationInRange(row.evaluation?.created_at, dateRange),
        )
        .map((row) => mapEvaluationReport(row, assignedHeadquarterName || null))
        .filter((item): item is EvaluationReport => Boolean(item));

      if (reports.length === 0) {
        toast.error("No hay evaluaciones para este tipo", {
          description: `No se encontraron evaluaciones de tipo ${type} para el período seleccionado.`,
        });
        return;
      }

      generateEvaluationsPDF(
        reports,
        `evaluaciones_${type.toLowerCase()}_${period}`,
        {
          generatedBy: getHeadquarterDirectorLabel(),
          headquartersName: assignedHeadquarterName || "Sin sede",
        },
      );

      toast.success("Reporte generado", {
        description: `Se descargó el reporte de evaluaciones ${type} para ${period}.`,
      });
    } catch (error) {
      console.error("Error generando reporte de evaluaciones:", error);
      toast.error("Error al generar reporte", {
        description:
          "No se pudo generar el reporte de evaluaciones. Intente de nuevo.",
      });
    }
  };

  const exportEvaluationsByBeneficiary = async (
    beneficiaryId: string,
    period: "day" | "week" | "month",
    referenceDate: Date | undefined,
  ) => {
    if (!assignedHeadquarterId) {
      toast.error("No se pudo exportar", {
        description: "No hay sede asignada para generar el reporte.",
      });
      return;
    }

    try {
      const rawRows = await evaluationService.getByHeadquarterId(
        assignedHeadquarterId,
      );

      const reports = rawRows
        .filter((row) => row.beneficiary_id === beneficiaryId)
        .map((row) => mapEvaluationReport(row, assignedHeadquarterName || null))
        .filter((item): item is EvaluationReport => Boolean(item));

      if (reports.length === 0) {
        toast.error("No hay evaluaciones para el beneficiario", {
          description: "No se encontraron evaluaciones para el beneficiario.",
        });
        return;
      }

      generateEvaluationsPDF(
        reports,
        `evaluaciones_beneficiario_${beneficiaryId}`,
        {
          generatedBy: getHeadquarterDirectorLabel(),
          headquartersName: assignedHeadquarterName || "Sin sede",
        },
      );

      toast.success("Reporte generado", {
        description: "Se descargó el reporte de evaluaciones del beneficiario.",
      });
    } catch (error) {
      console.error("Error generando reporte de beneficiario:", error);
      toast.error("Error al generar reporte", {
        description:
          "No se pudo generar el reporte del beneficiario. Intente de nuevo.",
      });
    }
  };

  const exportEvaluationById = async (evaluationId: string) => {
    if (!assignedHeadquarterId) {
      toast.error("No se pudo exportar", {
        description: "No hay sede asignada para generar el reporte.",
      });
      return;
    }

    try {
      const rawRow = await evaluationService.getDetail(evaluationId);
      const report = mapEvaluationReport(
        rawRow,
        assignedHeadquarterName || null,
      );

      if (!report) {
        toast.error("No hay evaluaciones para el identificador", {
          description:
            "No se pudo encontrar la evaluación solicitada para exportar.",
        });
        return;
      }

      generateEvaluationsPDF([report], `evaluacion_${evaluationId}`, {
        generatedBy: getHeadquarterDirectorLabel(),
        headquartersName: assignedHeadquarterName || "Sin sede",
      });

      toast.success("Reporte generado", {
        description: "Se descargó el reporte de la evaluación seleccionada.",
      });
    } catch (error) {
      console.error("Error generando reporte de evaluación:", error);
      toast.error("Error al generar reporte", {
        description:
          "No se pudo generar el reporte de la evaluación. Intente de nuevo.",
      });
    }
  };

  const exportAllEvaluations = async (
    period: "day" | "week" | "month",
    referenceDate: Date | undefined,
  ) => {
    if (!assignedHeadquarterId) {
      toast.error("No se pudo exportar", {
        description: "No hay sede asignada para generar el reporte.",
      });
      return;
    }

    const dateRange = buildDateRange(period, referenceDate ?? new Date());

    try {
      const rawRows = await evaluationService.getByHeadquarterId(
        assignedHeadquarterId,
      );

      const reports = rawRows
        .filter((row) =>
          isEvaluationInRange(row.evaluation?.created_at, dateRange),
        )
        .map((row) => mapEvaluationReport(row, assignedHeadquarterName || null))
        .filter((item): item is EvaluationReport => Boolean(item));

      if (reports.length === 0) {
        toast.error("No hay evaluaciones", {
          description:
            "No se encontraron evaluaciones para el período seleccionado.",
        });
        return;
      }

      generateEvaluationsPDF(reports, `evaluaciones_todas_${period}`, {
        generatedBy: getHeadquarterDirectorLabel(),
        headquartersName: assignedHeadquarterName || "Sin sede",
      });

      toast.success("Reporte generado", {
        description:
          "Se descargó el reporte de evaluaciones de todos los beneficiarios.",
      });
    } catch (error) {
      console.error("Error generando reporte de evaluaciones:", error);
      toast.error("Error al generar reporte", {
        description:
          "No se pudo generar el reporte de evaluaciones. Intente de nuevo.",
      });
    }
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
    exportEvaluationById,
    exportAllEvaluations,
    formatDate,
    getEvaluationTypeLabel,
    getFantasticLetterTabs,
  };
};
