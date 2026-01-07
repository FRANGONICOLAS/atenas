import { useState } from 'react';
import { toast } from 'sonner';
import type {
  Beneficiary,
  BeneficiaryStatus,
  Evaluation,
  EvaluationType,
  SedeReport,
  ReportType
} from '@/types';

export const useDirectorSedeView = () => {
  const sedeName = 'Sede Norte'; // This would come from user context or props

  // Beneficiaries state
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [beneficiarySearch, setBeneficiarySearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Evaluations state
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [evaluationSearch, setEvaluationSearch] = useState('');
  const [evaluationTypeFilter, setEvaluationTypeFilter] = useState('all');
  const [evaluationDateRange, setEvaluationDateRange] = useState<{ from?: Date; to?: Date }>({});

  // Reports state
  const [reports, setReports] = useState<SedeReport[]>([]);
  const [reportTypeFilter, setReportTypeFilter] = useState('all');

  // Beneficiary handlers
  const handleCreateBeneficiary = () => {
    toast.info('Crear beneficiario', {
      description: 'Funcionalidad en desarrollo',
    });
  };

  const handleEditBeneficiary = (beneficiary: Beneficiary) => {
    toast.info('Editar beneficiario', {
      description: `Editando: ${beneficiary.name}`,
    });
  };

  const handleDeleteBeneficiary = (beneficiaryId: number) => {
    setBeneficiaries(prev => prev.filter(b => b.id !== beneficiaryId));
    toast.success('Beneficiario eliminado de la sede');
  };

  const handleSaveBeneficiary = (beneficiary: Partial<Beneficiary>) => {
    if (beneficiary.id) {
      setBeneficiaries(prev => prev.map(b => b.id === beneficiary.id ? { ...b, ...beneficiary } as Beneficiary : b));
      toast.success('Beneficiario actualizado');
    } else {
      const newBeneficiary = {
        ...beneficiary,
        id: Math.max(...beneficiaries.map(b => b.id), 0) + 1,
      } as Beneficiary;
      setBeneficiaries(prev => [...prev, newBeneficiary]);
      toast.success('Beneficiario agregado a la sede');
    }
  };

  // Evaluation handlers
  const handleCreateEvaluation = () => {
    toast.info('Nueva evaluación', {
      description: 'Funcionalidad en desarrollo',
    });
  };

  const handleEditEvaluation = (evaluation: Evaluation) => {
    toast.info('Editar evaluación', {
      description: `Editando evaluación de: ${evaluation.beneficiaryName}`,
    });
  };

  const handleDeleteEvaluation = (evaluationId: number) => {
    setEvaluations(prev => prev.filter(e => e.id !== evaluationId));
    toast.success('Evaluación eliminada');
  };

  const handleSaveEvaluation = (evaluation: Partial<Evaluation>) => {
    if (evaluation.id) {
      setEvaluations(prev => prev.map(e => e.id === evaluation.id ? { ...e, ...evaluation } as Evaluation : e));
      toast.success('Evaluación actualizada');
    } else {
      const newEvaluation = {
        ...evaluation,
        id: Math.max(...evaluations.map(e => e.id), 0) + 1,
      } as Evaluation;
      setEvaluations(prev => [...prev, newEvaluation]);
      toast.success('Evaluación registrada');
    }
  };

  // Report handlers
  const handleGenerateReport = (type: 'monthly' | 'quarterly' | 'annual') => {
    toast.success('Generando reporte', {
      description: `Generando reporte ${type === 'monthly' ? 'mensual' : type === 'quarterly' ? 'trimestral' : 'anual'}`,
    });
  };

  const handleExportReport = (reportId: number, format: 'excel' | 'pdf') => {
    toast.success('Exportando reporte', {
      description: `Descargando reporte en formato ${format.toUpperCase()}`,
    });
  };

  const handleDeleteReport = (reportId: number) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
    toast.success('Reporte eliminado');
  };

  // Utility functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getEvaluationTypeLabel = (type: EvaluationType) => {
    const labels = {
      physical: 'Física',
      technical: 'Técnica',
      tactical: 'Táctica',
      psychological: 'Psicológica',
    };
    return labels[type];
  };

  const getStatusLabel = (status: BeneficiaryStatus) => {
    const labels = {
      active: 'Activo',
      pending: 'Pendiente',
      inactive: 'Inactivo',
    };
    return labels[status];
  };

  return {
    // Sede info
    sedeName,

    // Beneficiaries
    beneficiaries,
    setBeneficiaries,
    beneficiarySearch,
    setBeneficiarySearch,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    handleCreateBeneficiary,
    handleEditBeneficiary,
    handleDeleteBeneficiary,
    handleSaveBeneficiary,

    // Evaluations
    evaluations,
    setEvaluations,
    evaluationSearch,
    setEvaluationSearch,
    evaluationTypeFilter,
    setEvaluationTypeFilter,
    evaluationDateRange,
    setEvaluationDateRange,
    handleCreateEvaluation,
    handleEditEvaluation,
    handleDeleteEvaluation,
    handleSaveEvaluation,

    // Reports
    reports,
    setReports,
    reportTypeFilter,
    setReportTypeFilter,
    handleGenerateReport,
    handleExportReport,
    handleDeleteReport,

    // Utilities
    formatDate,
    getEvaluationTypeLabel,
    getStatusLabel,
  };
};
