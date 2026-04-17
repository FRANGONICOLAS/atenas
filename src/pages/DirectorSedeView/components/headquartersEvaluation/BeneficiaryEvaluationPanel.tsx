import { useEffect, useMemo, useState } from "react";
import { evaluationService } from "@/api/services";
import {
  getEvaluationComment,
  getEvaluationDetailByType,
  normalizeEvaluationType,
} from "@/lib/evaluationUtils";
import { getEvaluationScore } from "@/lib/beneficiaryCalculations";
import EvaluationPanel from "@/pages/Public/components/EvaluationPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import type { EvaluationRow } from "@/api/types";
import type {
  EvaluationPanelItem,
  EvaluationType,
} from "@/types/evaluation.types";

const normalizeMetricValue = (value: unknown): number | string | undefined => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const numeric = Number(trimmed);
    return Number.isNaN(numeric) ? trimmed : numeric;
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const entry = value as Record<string, unknown>;
    if (typeof entry.value === "number") return entry.value;
    if (typeof entry.value === "string") {
      const trimmed = entry.value.trim();
      if (!trimmed) return undefined;
      const numeric = Number(trimmed);
      return Number.isNaN(numeric) ? trimmed : numeric;
    }
    if (typeof entry.answer === "string" && entry.answer.trim()) {
      return entry.answer.trim();
    }
  }

  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .join(", ");
  }

  return undefined;
};

const flattenNestedMetrics = (
  value: unknown,
  parentKey = "",
): Record<string, number | string> => {
  const result: Record<string, number | string> = {};

  if (value === null || value === undefined) {
    return result;
  }

  if (Array.isArray(value)) {
    const arrayValue = value
      .filter((item): item is string => typeof item === "string")
      .join(", ");
    if (arrayValue) {
      result[parentKey] = arrayValue;
    }
    return result;
  }

  if (typeof value === "object") {
    for (const [key, child] of Object.entries(
      value as Record<string, unknown>,
    )) {
      const metricKey = parentKey ? `${parentKey}.${key}` : key;
      if (
        typeof child === "number" ||
        typeof child === "string" ||
        typeof child === "boolean" ||
        Array.isArray(child)
      ) {
        const normalizedValue = normalizeMetricValue(child);
        if (normalizedValue !== undefined) {
          result[metricKey] = normalizedValue;
        }
      } else {
        Object.assign(result, flattenNestedMetrics(child, metricKey));
      }
    }
    return result;
  }

  const normalizedValue = normalizeMetricValue(value);
  if (normalizedValue !== undefined) {
    result[parentKey] = normalizedValue;
  }

  return result;
};

const averageAspect = (
  detail: Record<string, unknown>,
  aspect: string,
): number | undefined => {
  const aspectValue = detail[aspect];
  if (
    !aspectValue ||
    typeof aspectValue !== "object" ||
    Array.isArray(aspectValue)
  ) {
    return undefined;
  }

  const numericValues = Object.values(aspectValue)
    .map(normalizeMetricValue)
    .filter((value): value is number => typeof value === "number");

  if (numericValues.length === 0) return undefined;

  const average =
    numericValues.reduce((total, value) => total + value, 0) /
    numericValues.length;
  return Number(average.toFixed(2));
};

const mapToPanelItem = (
  evaluation: EvaluationRow,
): EvaluationPanelItem | null => {
  const normalizedType = normalizeEvaluationType(evaluation.type);
  if (!normalizedType) return null;

  const detail = getEvaluationDetailByType(evaluation);
  const metrics =
    detail && typeof detail === "object" && !Array.isArray(detail)
      ? Object.entries(detail).reduce<Record<string, number | string>>(
          (acc, [key, value]) => {
            const metricValue = normalizeMetricValue(value);
            if (metricValue !== undefined) {
              acc[key] = metricValue;
            }
            return acc;
          },
          {},
        )
      : undefined;

  return {
    id: evaluation.id,
    date: evaluation.created_at ?? new Date().toISOString(),
    type: normalizedType,
    score: getEvaluationScore(evaluation),
    notes: getEvaluationComment(evaluation),
    metrics: Object.keys(metrics || {}).length > 0 ? metrics : undefined,
    graphMetrics: Object.keys(metrics || {}).length > 0 ? metrics : undefined,
  };
};

const mapTechnicalToPanelItem = (
  evaluation: EvaluationRow,
): EvaluationPanelItem | null => {
  const detail = getEvaluationDetailByType(evaluation);
  if (!detail || typeof detail !== "object" || Array.isArray(detail)) {
    return null;
  }

  const fullMetrics = flattenNestedMetrics(detail);
  const graphMetrics: Record<string, number | string> = {};
  const paseAvg = averageAspect(detail as Record<string, unknown>, "pase");
  const recepcionAvg = averageAspect(
    detail as Record<string, unknown>,
    "recepcion",
  );
  const remateAvg = averageAspect(detail as Record<string, unknown>, "remate");
  const conductionAvg = averageAspect(
    detail as Record<string, unknown>,
    "conduccion",
  );

  if (paseAvg !== undefined) graphMetrics.pase = paseAvg;
  if (recepcionAvg !== undefined) graphMetrics.recepcion = recepcionAvg;
  if (remateAvg !== undefined) graphMetrics.remate = remateAvg;
  if (conductionAvg !== undefined) graphMetrics.conduccion = conductionAvg;

  return {
    id: evaluation.id,
    date: evaluation.created_at ?? new Date().toISOString(),
    type: "TECHNICAL",
    score: getEvaluationScore(evaluation),
    notes: getEvaluationComment(evaluation),
    metrics: Object.keys(fullMetrics).length > 0 ? fullMetrics : undefined,
    graphMetrics:
      Object.keys(graphMetrics).length > 0 ? graphMetrics : undefined,
  };
};

interface BeneficiaryEvaluationPanelProps {
  beneficiaryId: string;
}

const typeOptions: Array<{ value: EvaluationType; label: string }> = [
  { value: "ANTHROPOMETRIC", label: "Antropométrica" },
  { value: "TECHNICAL", label: "Técnico-Táctica" },
  { value: "EMOTIONAL", label: "Emocional" },
];

export default function BeneficiaryEvaluationPanel({
  beneficiaryId,
}: BeneficiaryEvaluationPanelProps) {
  const [loading, setLoading] = useState(true);
  const [evaluationItems, setEvaluationItems] = useState<EvaluationPanelItem[]>(
    [],
  );
  const [selectedType, setSelectedType] = useState<"" | EvaluationType>("");

  useEffect(() => {
    if (!beneficiaryId) {
      setEvaluationItems([]);
      setLoading(false);
      return;
    }

    const loadEvaluations = async () => {
      setLoading(true);
      try {
        const rows = await evaluationService.getByBeneficiaryId(beneficiaryId);
        const items = rows
          .map((row) => row.evaluation)
          .filter((evaluation): evaluation is EvaluationRow => !!evaluation)
          .map((evaluation) => {
            const type = normalizeEvaluationType(evaluation.type);
            if (type === "TECHNICAL") {
              return mapTechnicalToPanelItem(evaluation);
            }
            return mapToPanelItem(evaluation);
          })
          .filter((item): item is EvaluationPanelItem => item !== null);

        setEvaluationItems(items);
      } catch (error) {
        setEvaluationItems([]);
      } finally {
        setLoading(false);
      }
    };

    void loadEvaluations();
  }, [beneficiaryId]);

  const filteredEvaluations = useMemo(
    () =>
      selectedType === ""
        ? []
        : evaluationItems.filter((item) => item.type === selectedType),
    [evaluationItems, selectedType],
  );

  const noDataLabel =
    selectedType === ""
      ? "Selecciona un tipo de evaluación"
      : `No hay evaluaciones ${
          selectedType === "ANTHROPOMETRIC"
            ? "antropométricas"
            : selectedType === "TECHNICAL"
              ? "técnico-tácticas"
              : "emocionales"
        }`;

  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle>Comparativa de evaluaciones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 items-center mb-4">
          <div className="w-48">
            <Select
              value={selectedType}
              onValueChange={(value) =>
                setSelectedType(value as "" | EvaluationType)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo de evaluación" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            Cargando evaluaciones...
          </div>
        ) : (
          <EvaluationPanel
            evaluations={filteredEvaluations}
            emptyLabel={noDataLabel}
            showGraph={true}
            languageOverride="es"
          />
        )}
      </CardContent>
    </Card>
  );
}
