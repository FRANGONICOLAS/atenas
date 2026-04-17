import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { evaluationService } from "@/api/services";
import {
  getEvaluationComment,
  getEvaluationDetailByType,
  normalizeEvaluationType,
} from "@/lib/evaluationUtils";
import { getEvaluationScore } from "@/lib/beneficiaryCalculations";
import type { EvaluationRow } from "@/api/types";
import EvaluationPanel from "@/pages/Public/components/EvaluationPanel";
import type { BeneficiaryPublicWithDetails } from "@/types/beneficiary.types";
import type { EvaluationPanelItem } from "@/types/evaluation.types";

interface PlayerDetailModalProps {
  open: boolean;
  player: BeneficiaryPublicWithDetails | null;
  onOpenChange: (open: boolean) => void;
}

const normalizeMetricValue = (value: unknown): number | string | undefined => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const numeric = Number(trimmed);
    return Number.isNaN(numeric) ? trimmed : numeric;
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

  if (numericValues.length === 0) {
    return undefined;
  }

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

const PlayerDetailModal = ({
  open,
  player,
  onOpenChange,
}: PlayerDetailModalProps) => {
  const { t, language } = useLanguage();
  const locale = language === "en" ? "en-US" : "es-ES";
  const [evaluations, setEvaluations] = useState<EvaluationPanelItem[]>([]);
  const [loadingEvaluations, setLoadingEvaluations] = useState(false);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvaluations = async () => {
      if (!open || !player?.id) {
        setEvaluations([]);
        setEvaluationError(null);
        return;
      }

      setLoadingEvaluations(true);
      setEvaluationError(null);

      try {
        const rows = await evaluationService.getByBeneficiaryId(player.id);
        const items = rows
          .map((row) => row.evaluation)
          .filter((evaluation): evaluation is EvaluationRow => !!evaluation)
          .map((evaluation) => {
            const normalizedType = normalizeEvaluationType(evaluation.type);
            if (normalizedType === "TECHNICAL") {
              return mapTechnicalToPanelItem(evaluation);
            }
            return mapToPanelItem(evaluation);
          })
          .filter((item): item is EvaluationPanelItem => item !== null);

        setEvaluations(items);
      } catch (error) {
        setEvaluationError(
          "No se pudieron cargar las evaluaciones del jugador.",
        );
        setEvaluations([]);
      } finally {
        setLoadingEvaluations(false);
      }
    };

    void loadEvaluations();
  }, [open, player?.id]);

  const emotionalEvaluations = evaluations.filter(
    (e) => e.type === "EMOTIONAL",
  );
  const anthropometricEvaluations = evaluations.filter(
    (e) => e.type === "ANTHROPOMETRIC",
  );
  const technicalEvaluations = evaluations.filter(
    (e) => e.type === "TECHNICAL",
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {player && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">
                {player.firstName} {player.lastName}
              </DialogTitle>
              <div className="flex items-center gap-2 pt-1">
                <Badge>{player.category}</Badge>
                <span className="text-sm text-muted-foreground">
                  {player.age} años · {player.status}
                </span>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-[180px_1fr] gap-4">
              <div className="space-y-3">
                {player.photoUrl ? (
                  <img
                    src={player.photoUrl}
                    alt={`${player.firstName} ${player.lastName}`}
                    className="w-full h-48 object-cover rounded-lg border border-border"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-muted rounded-lg border border-border">
                    <User className="w-16 h-16 text-muted-foreground/40" />
                  </div>
                )}
                <div className="text-center space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t.players.memberSince}
                    </p>
                    <p className="text-sm font-medium">
                      {new Date(player.registryDate).toLocaleDateString(
                        locale,
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <div className="text-lg font-bold">
                      {evaluations.length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t.players.reviews ?? "Evaluaciones"}
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <div className="text-lg font-bold">
                      {player.category.replace("Categoría ", "Cat. ")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t.players.categoryPlaceholder}
                    </div>
                  </div>
                </div>

                {evaluationError && (
                  <div className="py-3 px-4 rounded-lg bg-amber-50 text-amber-800 text-sm">
                    {evaluationError}
                  </div>
                )}

                {loadingEvaluations ? (
                  <div className="py-10 text-center text-muted-foreground">
                    Cargando evaluaciones...
                  </div>
                ) : (
                  <Tabs defaultValue="emocional" className="w-full">
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="emocional">
                        {t.evaluations.tabs.emotional}
                      </TabsTrigger>
                      <TabsTrigger value="antropometrica">
                        {t.evaluations.tabs.anthropometric}
                      </TabsTrigger>
                      <TabsTrigger value="tecnica">
                        {t.evaluations.tabs.technical}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="emocional">
                      <EvaluationPanel
                        evaluations={emotionalEvaluations}
                        emptyLabel={t.evaluations.emptyEmotional}
                      />
                    </TabsContent>

                    <TabsContent value="antropometrica">
                      <EvaluationPanel
                        evaluations={anthropometricEvaluations}
                        emptyLabel={t.evaluations.emptyAnthropometric}
                      />
                    </TabsContent>

                    <TabsContent value="tecnica">
                      <EvaluationPanel
                        evaluations={technicalEvaluations}
                        emptyLabel={t.evaluations.emptyTechnical}
                      />
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PlayerDetailModal;
