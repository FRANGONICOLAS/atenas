import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { evaluationService } from "@/api/services";
import { FullScreenLoader } from "@/components/common/FullScreenLoader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EmotionalEvaluationTabs from "@/pages/DirectorSedeView/components/headquartersEvaluation/EmotionalEvaluationTabs";
import TechnicalEvaluationTabs from "@/pages/DirectorSedeView/components/headquartersEvaluation/TechnicalEvaluationTabs";
import AnthropometricEvaluationTabs from "@/pages/DirectorSedeView/components/headquartersEvaluation/AnthropometricEvaluationTabs";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useSedeEvaluations } from "@/hooks/useSedeEvaluations";
import {
  getEvaluationDetailByType,
  normalizeEvaluationType,
} from "@/lib/evaluationUtils";

interface EvaluationDetailState {
  beneficiaryId: string;
  beneficiaryName: string;
  createdAt: string;
  type: "ANTHROPOMETRIC" | "TECHNICAL" | "EMOTIONAL";
  detail?: Record<string, unknown> | null;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatLabel = (value: string) => {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const renderSimpleValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  if (typeof value === "boolean") {
    return value ? "Sí" : "No";
  }

  if (Array.isArray(value)) {
    return value.length === 0 ? "N/A" : value.join(", ");
  }

  if (isPlainObject(value)) {
    return JSON.stringify(value, null, 0);
  }

  return String(value);
};

const renderAnthropometricDetail = (detail: Record<string, unknown>) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
    {Object.entries(detail).map(([key, value]) => (
      <div
        key={key}
        className="rounded-2xl border border-border bg-background p-4"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {formatLabel(key)}
        </p>
        <p className="mt-2 font-semibold text-foreground">
          {renderSimpleValue(value)}
        </p>
      </div>
    ))}
  </div>
);

const renderDetailList = (
  type: "ANTHROPOMETRIC" | "TECHNICAL" | "EMOTIONAL",
  detail?: Record<string, unknown>,
) => {
  if (!detail || Object.keys(detail).length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Sin datos registrados.
      </div>
    );
  }

  switch (type) {
    case "EMOTIONAL":
      return <EmotionalEvaluationTabs detail={detail} />;
    case "TECHNICAL":
      return <TechnicalEvaluationTabs detail={detail} />;
    case "ANTHROPOMETRIC":
      return <AnthropometricEvaluationTabs detail={detail} />;
    default:
      return renderAnthropometricDetail(detail);
  }
};

const EvaluationDetailPage = () => {
  const { evaluationId } = useParams<{ evaluationId: string }>();
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<EvaluationDetailState | null>(null);
  const { getEvaluationTypeLabel } = useSedeEvaluations();

  useEffect(() => {
    const loadDetail = async () => {
      if (!evaluationId) return;

      try {
        setLoading(true);
        const data = await evaluationService.getDetail(evaluationId);
        const beneficiaryName = `${data.beneficiary?.first_name ?? ""} ${
          data.beneficiary?.last_name ?? ""
        }`.trim();
        const type =
          normalizeEvaluationType(data.evaluation?.type) ?? "EMOTIONAL";

        setDetail({
          beneficiaryId: data.beneficiary_id || "",
          beneficiaryName: beneficiaryName || "Jugador",
          createdAt: data.evaluation?.created_at || new Date().toISOString(),
          type,
          detail: data.evaluation
            ? (getEvaluationDetailByType(data.evaluation) as Record<
                string,
                unknown
              > | null)
            : null,
        });
      } catch (error) {
        setDetail(null);
      } finally {
        setLoading(false);
      }
    };

    void loadDetail();
  }, [evaluationId]);

  const breadcrumbName = useMemo(
    () => detail?.beneficiaryName || "Detalle de evaluacion",
    [detail?.beneficiaryName],
  );

  if (loading) {
    return <FullScreenLoader message="Cargando evaluacion..." />;
  }

  if (!detail) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link
            to="/director-sede?tab=evaluations"
            className="inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a evaluaciones
          </Link>
        </Button>
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            No se encontro la evaluacion solicitada.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/director-sede?tab=evaluations">Evaluaciones</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{breadcrumbName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Detalle de evaluación
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {`Evaluación realizada el ${formatDate(detail.createdAt)}`}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/director-sede?tab=evaluations">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Jugador
                </div>
                <div className="text-lg font-semibold">
                  {detail.beneficiaryName}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Tipo de evaluación
                </div>
                <Badge>{getEvaluationTypeLabel(detail.type)}</Badge>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Fecha</div>
                <div>{formatDate(detail.createdAt)}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preguntas y respuestas</CardTitle>
            </CardHeader>
            <CardContent>
              {renderDetailList(
                detail.type,
                detail.detail as Record<string, unknown>,
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EvaluationDetailPage;
