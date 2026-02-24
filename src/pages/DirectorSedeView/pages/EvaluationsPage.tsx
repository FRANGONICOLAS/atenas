import { useMemo, useState } from "react";
import { ClipboardList, Plus } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPerformanceColor } from "@/lib/beneficiaryUtils";
import { FullScreenLoader } from "@/components/common/FullScreenLoader";
import { useSedeEvaluations } from "@/hooks/useSedeEvaluations";
import {
  EvaluationFilters,
  EvaluationStats,
  EvaluationTable,
  CreateEvaluationModal,
  EditEvaluationModal,
} from "@/pages/DirectorSedeView/components/headquartersEvaluation";
import type { Evaluation, EvaluationType } from "@/types";

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

  const categoryOptions = useMemo(
    () => [
      { value: "all", label: "Todas las categorias" },
      ...(["physical", "technical", "tactical", "psychological"] as EvaluationType[]).map(
        (type) => ({
          value: type,
          label: getEvaluationTypeLabel(type),
        }),
      ),
    ],
    [getEvaluationTypeLabel],
  );

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((evaluation) => {
      const matchesSearch = evaluation.beneficiaryName
        .toLowerCase()
        .includes(evaluationSearch.toLowerCase());
      const matchesCategory =
        evaluationTypeFilter === "all" || evaluation.type === evaluationTypeFilter;

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
          <h2 className="text-2xl font-bold text-gray-900">Evaluaciones y Seguimiento</h2>
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
