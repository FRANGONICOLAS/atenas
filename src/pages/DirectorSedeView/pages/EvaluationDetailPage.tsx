import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { evaluationService } from "@/api/services";
import type {
  AntropometricData,
  EmotionalData,
  TechnicalTacticalData,
} from "@/types/beneficiary.types";
import { FullScreenLoader } from "@/components/common/FullScreenLoader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface EvaluationDetailState {
  beneficiaryName: string;
  createdAt: string;
  anthropometric?: AntropometricData;
  technical?: TechnicalTacticalData;
  emotional?: EmotionalData;
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

const renderDetailList = (detail?: Record<string, unknown>) => {
  if (!detail || Object.keys(detail).length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Sin datos registrados.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      {Object.entries(detail).map(([key, value]) => (
        <div key={key} className="space-y-1">
          <div className="text-muted-foreground">{formatLabel(key)}</div>
          <div className="font-medium">
            {value === null || value === undefined || value === ""
              ? "N/A"
              : typeof value === "boolean"
                ? value
                  ? "Si"
                  : "No"
                : String(value)}
          </div>
        </div>
      ))}
    </div>
  );
};

const EvaluationDetailPage = () => {
  const { evaluationId } = useParams<{ evaluationId: string }>();
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<EvaluationDetailState | null>(null);

  useEffect(() => {
    const loadDetail = async () => {
      if (!evaluationId) return;

      try {
        setLoading(true);
        const data = await evaluationService.getDetail(evaluationId);
        const beneficiaryName = `${data.beneficiary?.first_name ?? ""} ${
          data.beneficiary?.last_name ?? ""
        }`.trim();

        setDetail({
          beneficiaryName: beneficiaryName || "Beneficiario",
          createdAt: data.evaluation?.created_at || new Date().toISOString(),
          anthropometric: (data.evaluation?.anthropometric_detail as AntropometricData) || undefined,
          technical: (data.evaluation?.technical_tactic_detail as TechnicalTacticalData) || undefined,
          emotional: (data.evaluation?.emotional_detail as EmotionalData) || undefined,
        });
      } catch (error) {
        console.error("Error loading evaluation detail:", error);
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
          <Link to="/director-sede?tab=evaluations" className="inline-flex items-center">
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
            <h2 className="text-2xl font-bold text-gray-900">Detalle de evaluacion</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {`Evaluacion realizada el ${formatDate(detail.createdAt)}`}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/director-sede?tab=evaluations">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resultados por area</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="anthropometric">
              <AccordionTrigger>Evaluacion antropometrica</AccordionTrigger>
              <AccordionContent>
                {renderDetailList(detail.anthropometric as Record<string, unknown>)}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="technical">
              <AccordionTrigger>Evaluacion tecnico-tactica</AccordionTrigger>
              <AccordionContent>
                {renderDetailList(detail.technical as Record<string, unknown>)}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="emotional">
              <AccordionTrigger>Evaluacion emocional</AccordionTrigger>
              <AccordionContent>
                {renderDetailList(detail.emotional as Record<string, unknown>)}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Graficas</CardTitle>
        </CardHeader>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Espacio reservado para graficas futuras.
        </CardContent>
      </Card>
    </div>
  );
};

export default EvaluationDetailPage;
