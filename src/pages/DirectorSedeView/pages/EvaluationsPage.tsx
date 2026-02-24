import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Plus } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPerformanceColor } from "@/lib/beneficiaryUtils";
import { FullScreenLoader } from "@/components/common/FullScreenLoader";
import { useSedeEvaluations } from "@/hooks/useSedeEvaluations";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";
import EvaluationProgressChart from "@/pages/DirectorSedeView/components/headquartersEvaluation/EvaluationProgressChart";
import {
  EvaluationFilters,
  EvaluationStats,
  EvaluationTable,
  CreateEvaluationModal,
  EditEvaluationModal,
} from "@/pages/DirectorSedeView/components/headquartersEvaluation";
import type { Evaluation, EvaluationType } from "@/types";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

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
    refresh,
  } = useSedeEvaluations();

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Evaluation | null>(null);
  const navigate = useNavigate();

  // beneficiaries for chart selector
  const {
    filtered: filteredBeneficiaries,
    loading: beneficiariesLoading,
  } = useBeneficiaries();
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string | null>(null);

  // default to first beneficiary when available
  useEffect(() => {
    if (!selectedBeneficiaryId && filteredBeneficiaries.length > 0) {
      setSelectedBeneficiaryId(filteredBeneficiaries[0].beneficiary_id);
    }
  }, [filteredBeneficiaries, selectedBeneficiaryId]);

  const categoryOptions = useMemo(
    () => [
      { value: "all", label: "Todas las categorias" },
      ...(
        [
          "anthropometric",
          "technical_tactic",
          "psychological_emotional",
        ] as EvaluationType[]
      ).map((type) => ({
        value: type,
        label: getEvaluationTypeLabel(type),
      })),
    ],
    [getEvaluationTypeLabel],
  );

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((evaluation) => {
      const matchesSearch = evaluation.beneficiaryName
        .toLowerCase()
        .includes(evaluationSearch.toLowerCase());
      const matchesCategory =
        evaluationTypeFilter === "all" ||
        evaluation.type === evaluationTypeFilter;

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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCreateEvaluation}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar
          </Button>
        </div>
      </div>

      <EvaluationStats
        total={stats.total}
        avgPerformance={stats.avgPerformance}
      />

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
                disabled={beneficiariesLoading || filteredBeneficiaries.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Beneficiario" />
                </SelectTrigger>
                <SelectContent>
                  {filteredBeneficiaries.map((b) => (
                    <SelectItem
                      key={b.beneficiary_id}
                      value={b.beneficiary_id}
                    >
                      {`${b.first_name} ${b.last_name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {selectedBeneficiaryId ? (
            <EvaluationProgressChart
              beneficiaryId={selectedBeneficiaryId}
            />
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
          <EvaluationTable
            evaluations={filteredEvaluations}
            onView={handleViewEvaluation}
            onEdit={setEditTarget}
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
