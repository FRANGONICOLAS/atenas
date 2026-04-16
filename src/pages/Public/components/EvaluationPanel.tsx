import { useCallback, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale, // Necesario para el Radar
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Radar } from "react-chartjs-2";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/i18n/i18n";
import type { EvaluationPanelProps } from "@/types/evaluation.types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

function EvaluationPanel({
  evaluations,
  emptyLabel,
  showGraph = true,
  languageOverride,
}: EvaluationPanelProps) {
  const { language: contextLanguage, t: contextT } = useLanguage();
  const language = languageOverride ?? contextLanguage;
  const t = languageOverride ? translations[language] : contextT;
  const locale = language === "en" ? "en-US" : "es-ES";
  const [openGraph, setOpenGraph] = useState<"radar" | "line" | null>(null);

  const graphTitle =
    openGraph === "radar"
      ? t.evaluations.graphRadarTitle
      : openGraph === "line"
        ? t.evaluations.graphLineTitle
        : "";

  const fantasticSections = useMemo(
    () => [
      { key: "F", display: "F", range: [1, 2, 3, 4, 5] },
      { key: "A1", display: "A", range: [6, 7, 8, 9, 10] },
      { key: "N", display: "N", range: [11, 12, 13, 14, 15] },
      { key: "T1", display: "T", range: [16, 17, 18, 19, 20] },
      { key: "A2", display: "A", range: [21, 22, 23, 24, 25] },
      { key: "S", display: "S", range: [26, 27, 28, 29, 30] },
      { key: "T2", display: "T", range: [31, 32, 33, 34, 35] },
      { key: "I", display: "I", range: [36, 37, 38, 39, 40] },
      { key: "C", display: "C", range: [41, 42, 43, 44, 45] },
    ],
    [],
  );

  const emotionalHistoryLabels = useMemo(
    () => ({
      F: "Familia y Amigos",
      A1: "Actividad Física",
      N: "Nutrición",
      T1: "Tabaco y Tóxicos",
      A2: "Alcohol",
      S: "Sueño y Estrés",
      T2: "Trabajo y Personalidad",
      I: "Introspección",
      C: "Conducción y Comportamiento Social",
    }),
    [],
  );

  const normalizeParsedMetricValue = useCallback(
    (value: unknown): number | string | undefined => {
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

      if (Array.isArray(value)) {
        return value
          .filter((item): item is string => typeof item === "string")
          .join(", ");
      }

      if (typeof value === "object" && value !== null) {
        return undefined;
      }

      return undefined;
    },
    [],
  );

  const flattenMetrics = useCallback(
    (value: unknown, parentKey = ""): Record<string, number | string> => {
      const result: Record<string, number | string> = {};

      if (value === null || value === undefined) {
        return result;
      }

      if (typeof value === "object" && !Array.isArray(value)) {
        for (const [key, child] of Object.entries(value)) {
          const metricKey = parentKey ? `${parentKey}.${key}` : key;
          if (
            typeof child === "number" ||
            typeof child === "string" ||
            typeof child === "boolean" ||
            Array.isArray(child)
          ) {
            const normalized = normalizeParsedMetricValue(child);
            if (normalized !== undefined) {
              result[metricKey] = normalized;
            }
          } else if (typeof child === "object" && child !== null) {
            Object.assign(result, flattenMetrics(child, metricKey));
          }
        }
        return result;
      }

      const normalized = normalizeParsedMetricValue(value);
      if (normalized !== undefined) {
        result[parentKey] = normalized;
      }

      return result;
    },
    [normalizeParsedMetricValue],
  );

  const aggregateFantasticMetrics = useCallback(
    (metrics?: Record<string, number | string> | null) => {
      if (!metrics) return metrics;

      const isFantasticMetric = Object.keys(metrics).every((key) =>
        /^fantastic_\d+$/i.test(key),
      );

      if (!isFantasticMetric) return metrics;

      return fantasticSections.reduce(
        (acc, section) => {
          const values = section.range
            .map((index) => metrics[`fantastic_${index}`])
            .map(normalizeParsedMetricValue)
            .filter((value): value is number => typeof value === "number");

          if (values.length > 0) {
            const sum = values.reduce((total, value) => total + value, 0);
            acc[section.key] = Number((sum / values.length).toFixed(2));
          }

          return acc;
        },
        {} as Record<string, number | string>,
      );
    },
    [normalizeParsedMetricValue, fantasticSections],
  );

  const buildFantasticHistoryMetrics = useCallback(
    (metrics?: Record<string, number | string> | null) => {
      if (!metrics) return undefined;

      const isFantasticMetric = Object.keys(metrics).every((key) =>
        /^fantastic_\d+$/i.test(key),
      );
      if (!isFantasticMetric) return undefined;

      return fantasticSections.reduce(
        (acc, section) => {
          const values = section.range
            .map((index) => metrics[`fantastic_${index}`])
            .map(normalizeParsedMetricValue)
            .filter((value): value is number => typeof value === "number");

          if (values.length > 0) {
            const sum = values.reduce((total, value) => total + value, 0);
            acc[emotionalHistoryLabels[section.key]] = Number(sum.toFixed(2));
          }

          return acc;
        },
        {} as Record<string, number | string>,
      );
    },
    [emotionalHistoryLabels, fantasticSections, normalizeParsedMetricValue],
  );

  // 1. Procesamiento de datos y parseo de JSON
  const sortedEvaluations = useMemo(() => {
    return [...evaluations]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((ev) => {
        const sourceMetrics = ev.graphMetrics ?? ev.metrics;
        let parsedMetrics: Record<string, number | string> | undefined;

        if (typeof sourceMetrics === "string") {
          try {
            const parsed = JSON.parse(sourceMetrics);
            if (
              parsed &&
              typeof parsed === "object" &&
              !Array.isArray(parsed)
            ) {
              const normalized = flattenMetrics(parsed);
              parsedMetrics = aggregateFantasticMetrics(normalized);
            }
          } catch {
            parsedMetrics = undefined;
          }
        } else {
          parsedMetrics = aggregateFantasticMetrics(
            flattenMetrics(sourceMetrics),
          );
        }

        return {
          ...ev,
          parsedMetrics,
        };
      });
  }, [evaluations, aggregateFantasticMetrics, flattenMetrics]);

  if (sortedEvaluations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
        <p className="text-sm">{emptyLabel}</p>
      </div>
    );
  }

  // Tomamos la última y la penúltima para la comparativa del Radar
  const latestEv = sortedEvaluations[sortedEvaluations.length - 1];
  const prevEv =
    sortedEvaluations.length > 1
      ? sortedEvaluations[sortedEvaluations.length - 2]
      : null;

  // --- CONFIGURACIÓN DEL RADAR (Comparativa de parámetros) ---
  const metricKeys = latestEv.parsedMetrics
    ? Object.keys(latestEv.parsedMetrics)
    : [];

  const formatMetricKey = (key: string) => {
    const metricLabelMap: Record<string, { en: string; es: string }> = {
      pase: { es: "Pase", en: "Pass" },
      recepcion: { es: "Recepción", en: "Reception" },
      remate: { es: "Remate", en: "Shooting" },
      regate: { es: "Regate", en: "Dribbling" },
      conduccion: { es: "Conducción", en: "Ball control" },
      ubicacion_espacio_temporal: {
        es: "Ubicación espacio-temporal",
        en: "Spatial positioning",
      },
    };

    if (metricLabelMap[key]) {
      return metricLabelMap[key][language];
    }

    if (key.includes(" ")) {
      return key;
    }

    const fantasticMatch = key.match(/^fantastic_(\d+)$/i);
    if (fantasticMatch) {
      return `F${fantasticMatch[1]}`;
    }

    const sectionMatch = key.match(/^([A-Z])\d+$/i);
    if (sectionMatch) {
      return sectionMatch[1].toUpperCase();
    }

    return key.replace(/[_.]/g, " ").toUpperCase();
  };

  const radarData = {
    labels: metricKeys.map((k) => formatMetricKey(k)),
    datasets: [
      ...(prevEv
        ? [
            {
              label: t.evaluations.previous,
              data: metricKeys.map((k) => prevEv.parsedMetrics[k] || 0),
              borderColor: "rgba(16, 185, 129, 0.8)",
              backgroundColor: "rgba(16, 185, 129, 0.2)",
              borderWidth: 1,
              pointRadius: 0,
            },
          ]
        : []),
      {
        label: t.evaluations.current,
        data: metricKeys.map((k) => latestEv.parsedMetrics[k] || 0),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.3)",
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { display: true },
        suggestedMin: 0,
        ticks: { display: false, stepSize: 20 },
      },
    },
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { boxWidth: 12, font: { size: 10 } },
      },
    },
  };

  // --- CONFIGURACIÓN DE LA LÍNEA (Evolución del Score) ---
  const lineData = {
    labels: sortedEvaluations.map((ev) =>
      new Date(ev.date).toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
      }),
    ),
    datasets: [
      {
        label: t.evaluations.scoreTrend,
        data: sortedEvaluations.map((ev) => ev.score),
        fill: true,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  };

  return (
    <>
      {showGraph && (
        <div className="space-y-6">
          {/* Sección de Gráficos */}
          <div className="grid grid-cols-1 gap-4">
            {/* Radar: Comparación de Parámetros actuales */}
            <div className=" w-full bg-card p-4 rounded-xl border border-border flex flex-col">
              <div className="flex items-center justify-between mb-2 gap-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  {t.evaluations.analysisParameters}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenGraph("radar")}
                >
                  {t.evaluations.viewGraph}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista detallada de iteraciones */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-muted-foreground uppercase px-1">
          {t.evaluations.historyTitle}
        </span>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {[...sortedEvaluations].reverse().map((ev) => (
            <div
              key={ev.id}
              className="p-3 border border-border rounded-lg bg-card/50 hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold">
                  {new Date(ev.date).toLocaleDateString(locale, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <Badge
                  variant={ev.score > 70 ? "default" : "secondary"}
                  className="text-[10px]"
                >
                  {ev.score}%
                </Badge>
              </div>

              {ev.metrics && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 bg-muted/20 p-2 rounded text-[9px]">
                  {Object.entries(
                    ev.type === "EMOTIONAL"
                      ? (buildFantasticHistoryMetrics(ev.metrics) ?? ev.metrics)
                      : ev.metrics,
                  ).map(([key, val]) => (
                    <div
                      key={key}
                      className="flex justify-between border-b border-border/30 pb-0.5"
                    >
                      <span className="text-muted-foreground capitalize">
                        {formatMetricKey(key)}
                      </span>
                      <span className="font-bold text-primary">{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {showGraph && (
        <Dialog
          open={openGraph !== null}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setOpenGraph(null);
            }
          }}
        >
          <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>{graphTitle}</DialogTitle>
            </DialogHeader>
            <div className="h-[60vh]">
              {openGraph === "radar" ? (
                <Radar data={radarData} options={radarOptions} />
              ) : (
                <Line
                  data={lineData}
                  options={{
                    ...radarOptions,
                    scales: { y: { min: 0, max: 100 } },
                  }}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default EvaluationPanel;
