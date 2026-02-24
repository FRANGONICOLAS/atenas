import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  TimeScale,
} from "chart.js";
import { Line, PolarArea } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { evaluationService } from "@/api/services";
import { subMonths, subYears } from "date-fns";
import { getEvaluationScore } from "@/lib/beneficiaryCalculations";
import type { EvaluationRow } from "@/api/types";
import type { EvaluationType } from "@/types/evaluation.types";

// register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Title,
  ChartTooltip,
  Legend,
  TimeScale
);

interface HistoryPoint {
  date: string;
  value: number;
}

interface EvaluationProgressChartProps {
  beneficiaryId: string;
}

const typeOptions: Array<{ value: EvaluationType | "all"; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "anthropometric", label: "Antropométrica" },
  { value: "technical_tactic", label: "Técnico‑Táctica" },
  { value: "psychological_emotional", label: "Psicológica/Emocional" },
];

const rangeOptions: Array<{ value: "month" | "year"; label: string }> = [
  { value: "month", label: "Último mes" },
  { value: "year", label: "Último año" },
];

export default function EvaluationProgressChart({ beneficiaryId }: EvaluationProgressChartProps) {
  const [loading, setLoading] = useState(false);
  const [evaluations, setEvaluations] = useState<EvaluationRow[]>([]);
  const [typeFilter, setTypeFilter] = useState<EvaluationType | "all">("all");
  const [rangeFilter, setRangeFilter] = useState<"month" | "year">("month");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await evaluationService.getByBeneficiaryId(beneficiaryId);
        setEvaluations(
          rows
            .map((r) => r.evaluation)
            .filter((e): e is EvaluationRow => !!e)
            .sort((a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""))
        );
      } catch (e) {
        console.error("error loading beneficiary evaluations", e);
        setError("No se pudieron cargar las evaluaciones");
      } finally {
        setLoading(false);
      }
    };
    if (beneficiaryId) {
      void load();
    }
  }, [beneficiaryId]);

  const filteredPoints: HistoryPoint[] = useMemo(() => {
    const now = new Date();
    const cutoff =
      rangeFilter === "month" ? subMonths(now, 1) : subYears(now, 1);

    return evaluations
      .filter((ev) => {
        if (typeFilter !== "all" && ev.type !== typeFilter) return false;
        const created = ev.created_at ? new Date(ev.created_at) : null;
        if (!created) return false;
        if (created < cutoff) return false;
        return true;
      })
      .map((ev) => ({
        date: ev.created_at ?? "",
        value: getEvaluationScore(ev),
      }));
  }, [evaluations, typeFilter, rangeFilter]);

  const chartData = useMemo(() => {
    // ensure sorted ascending for the chart
    return filteredPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredPoints]);

  const lastTypeScores = useMemo(() => {
    const types: EvaluationType[] = [
      "anthropometric",
      "technical_tactic",
      "psychological_emotional",
    ];
    const result: Record<EvaluationType, number> = {
      anthropometric: 0,
      technical_tactic: 0,
      psychological_emotional: 0,
    };
    types.forEach((t) => {
      const matches = evaluations
        .filter((ev) => ev.type === t && ev.created_at)
        .sort((a, b) =>
          (b.created_at ?? "").localeCompare(a.created_at ?? "")
        );
      if (matches.length) {
        result[t] = getEvaluationScore(matches[0]);
      }
    });
    return result;
  }, [evaluations]);

  if (loading) {
    return <div className="text-center py-8">Cargando datos...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  if (evaluations.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-muted-foreground">
        Este beneficiario no tiene evaluaciones registradas.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* filters */}
      <div className="flex flex-wrap gap-4">
        <div className="w-40">
          <Select onValueChange={(v) => setTypeFilter(v as EvaluationType | "all")} value={typeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {typeFilter !== "all" && (
          <div className="w-40">
            <Select onValueChange={(v) => setRangeFilter(v as "month" | "year")} value={rangeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Rango" />
              </SelectTrigger>
              <SelectContent>
                {rangeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {typeFilter !== "all" ? (
        // show line chart for specific type
        chartData.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            No hay datos para mostrar en ese periodo.
          </div>
        ) : (
          <div className="flex justify-center" style={{ width: "100%", height: 400 }}>
            <Line
              options={{
                responsive: true,
                elements: {
                  point: {
                    pointStyle: 'rectRounded',
                    radius: 6,
                    hoverRadius: 8,
                  },
                },
                scales: {
                  x: {
                    type: "time",
                    time: { unit: "day", tooltipFormat: "dd/MM/yyyy" },
                    title: { display: false },
                  },
                  y: {
                    beginAtZero: true,
                  },
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.parsed.y}`,
                    },
                  },
                  legend: { display: false },
                },
              }}
              data={{
                labels: chartData.map((p) => p.date),
                datasets: [
                  {
                    label: "Valor",
                    data: chartData.map((p) => p.value),
                    borderColor: "#3b82f6",
                    backgroundColor: "#3b82f6",
                    tension: 0.1,
                    showLine: true,
                  },
                ],
              }}
            />
          </div>
        )
      ) : (

        // typeFilter === 'all', show only polar area
        Object.values(lastTypeScores).every((v) => v === 0) ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            No hay evaluaciones disponibles para generar la gráfica.
          </div>
        ) : (
          <div className="flex justify-center" style={{ width: "100%", height: 400 }}>
            <PolarArea
              data={{
                labels: [
                  "Antropométrica",
                  "Técnico‑Táctica",
                  "Psicológica/Emocional",
                ],
                datasets: [
                  {
                    data: [
                      lastTypeScores.anthropometric,
                      lastTypeScores.technical_tactic,
                      lastTypeScores.psychological_emotional,
                    ],
                    backgroundColor: [
                      "#3b82f6",
                      "#10b981",
                      "#f59e0b",
                    ],
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' },
                  tooltip: { enabled: true },
                },
                scales: {
                  r: { beginAtZero: true, suggestedMax: 100 },
                },
              }}
            />
          </div>
        )
      )}
    </div>
  );
}
