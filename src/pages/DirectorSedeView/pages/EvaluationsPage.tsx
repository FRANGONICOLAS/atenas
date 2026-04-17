import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPerformanceColor } from "@/lib";
import { FullScreenLoader } from "@/components/common/FullScreenLoader";
import { useSedeEvaluations } from "@/hooks/useSedeEvaluations";
import { useSedeBeneficiaries } from "@/hooks/useSedeBeneficiaries";
import BeneficiaryEvaluationPanel from "@/pages/DirectorSedeView/components/headquartersEvaluation/BeneficiaryEvaluationPanel";
import {
  EvaluationFilters,
  EvaluationStats,
  EvaluationTable,
  CreateEvaluationModal,
  EditEvaluationModal,
} from "@/pages/DirectorSedeView/components/headquartersEvaluation";
import type { Evaluation, EvaluationType } from "@/types";
import { normalizeEvaluationType } from "@/lib/evaluationUtils";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

const EvaluationsPage = () => {
  const {
    evaluations,
    loading,
    evaluationSearch,
    setEvaluationSearch,
    evaluationTypeFilter,
    setEvaluationTypeFilter,
    formatDate,
    getEvaluationTypeLabel,
    handleDeleteEvaluation,
    exportEvaluationById,
    exportAllEvaluations,
    refresh,
  } = useSedeEvaluations();

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Evaluation | null>(null);
  const navigate = useNavigate();

  // beneficiaries for chart selector
  const { filtered: filteredBeneficiaries, loading: beneficiariesLoading } =
    useSedeBeneficiaries();
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<
    string | null
  >(null);
  const [exportPeriod, setExportPeriod] = useState<"day" | "week" | "month">(
    "day",
  );
  const [exportDate, setExportDate] = useState<Date | undefined>(new Date());

  // default to first beneficiary when available
  useEffect(() => {
    if (!selectedBeneficiaryId && filteredBeneficiaries.length > 0) {
      setSelectedBeneficiaryId(filteredBeneficiaries[0].beneficiary_id);
    }
  }, [filteredBeneficiaries, selectedBeneficiaryId]);

  const categoryOptions = useMemo(
    () => [
      { value: "all", label: "Todas las categorias" },
      ...(["ANTHROPOMETRIC", "TECHNICAL", "EMOTIONAL"] as EvaluationType[]).map(
        (type) => ({
          value: type,
          label: getEvaluationTypeLabel(type),
        }),
      ),
    ],
    [getEvaluationTypeLabel],
  );

  const periodOptions = useMemo(
    () => [
      { value: "day", label: "Día" },
      { value: "week", label: "Semana" },
      { value: "month", label: "Mes" },
    ],
    [],
  );

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((evaluation) => {
      const matchesSearch = evaluation.beneficiaryName
        .toLowerCase()
        .includes(evaluationSearch.toLowerCase());
      const matchesCategory =
        evaluationTypeFilter === "all" ||
        normalizeEvaluationType(evaluation.type) === evaluationTypeFilter;

      return matchesSearch && matchesCategory;
    });
  }, [evaluations, evaluationSearch, evaluationTypeFilter]);

  const stats = useMemo(() => {
    const total = evaluations.length;
    const average = total
      ? evaluations.reduce((sum, item) => sum + item.score, 0) / total
      : 0;

    return {
      total,
      avgPerformance: Number(average.toFixed(1)),
    };
  }, [evaluations]);

  const handleViewEvaluation = (evaluation: Evaluation) => {
    navigate(`/director-sede/evaluations/${evaluation.id}`);
  };

  const handleCreateEvaluation = () => {
    setShowCreate(true);
  };

  const handleExportEvaluation = async (evaluation: Evaluation) => {
    await exportEvaluationById(evaluation.id);
  };

  if (loading) {
    return <FullScreenLoader message="Cargando evaluaciones..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Evaluaciones y Seguimiento
          </h2>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Button size="sm" onClick={handleCreateEvaluation}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Evaluación
          </Button>
        </div>
      </div>

      <EvaluationStats total={stats.total} />

      {/* chart selector */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso del beneficiario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <div className="w-48">
              <Select
                value={selectedBeneficiaryId ?? ""}
                onValueChange={(v) => setSelectedBeneficiaryId(v || null)}
                disabled={
                  beneficiariesLoading || filteredBeneficiaries.length === 0
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Beneficiario" />
                </SelectTrigger>
                <SelectContent>
                  {filteredBeneficiaries.map((b) => (
                    <SelectItem key={b.beneficiary_id} value={b.beneficiary_id}>
                      {`${b.first_name} ${b.last_name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {selectedBeneficiaryId ? (
            <BeneficiaryEvaluationPanel beneficiaryId={selectedBeneficiaryId} />
          ) : (
            <div className="text-center text-sm text-muted-foreground py-10">
              Seleccione un beneficiario para ver su progreso.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Evaluaciones de la sede
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <EvaluationFilters
            search={evaluationSearch}
            onSearchChange={setEvaluationSearch}
            categoryFilter={evaluationTypeFilter}
            onCategoryFilterChange={setEvaluationTypeFilter}
            categories={categoryOptions}
          />
          <div className="flex flex-wrap gap-2 items-center">
            <div className="w-40">
              <Select
                value={exportPeriod}
                onValueChange={(value) =>
                  setExportPeriod(value as "day" | "week" | "month")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Periodo" />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-56">
              <DatePicker
                date={exportDate}
                onDateChange={setExportDate}
                placeholder="Fecha base"
              />
            </div>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => exportAllEvaluations(exportPeriod, exportDate)}
            >
              Exportar todas las evaluaciones
            </Button>
          </div>

          <EvaluationTable
            evaluations={filteredEvaluations}
            onView={handleViewEvaluation}
            onEdit={setEditTarget}
            onExport={handleExportEvaluation}
            onDelete={(evaluation) => handleDeleteEvaluation(evaluation.id)}
            formatDate={formatDate}
            getPerformanceColor={getPerformanceColor}
            getTypeLabel={getEvaluationTypeLabel}
          />
        </CardContent>
      </Card>

      <CreateEvaluationModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSaved={refresh}
      />

      <EditEvaluationModal
        open={!!editTarget}
        evaluationId={editTarget?.id ?? null}
        beneficiaryName={editTarget?.beneficiaryName ?? ""}
        onClose={() => setEditTarget(null)}
        onSaved={refresh}
      />
    </div>
  );
};

export default EvaluationsPage;
