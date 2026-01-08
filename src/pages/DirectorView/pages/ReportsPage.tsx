import { FileText, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  generateProjectsExcel,
  generateProjectsPDF,
  generateBeneficiariesExcel,
  generateBeneficiariesPDF,
} from '@/lib/reportGenerator';

const ReportsPage = () => {
  const handleExportProjectsExcel = () => {
    toast.success('Generando reporte...', {
      description: 'El archivo Excel se descargará en breve',
    });
  };

  const handleExportProjectsPDF = () => {
    toast.success('Generando reporte...', {
      description: 'El archivo PDF se descargará en breve',
    });
  };

  const handleExportBeneficiariesExcel = () => {
    toast.success('Generando reporte...', {
      description: 'El archivo Excel se descargará en breve',
    });
  };

  const handleExportBeneficiariesPDF = () => {
    toast.success('Generando reporte...', {
      description: 'El archivo PDF se descargará en breve',
    });
  };

  const handleExportConsolidated = () => {
    toast.success('Generando reporte consolidado...', {
      description: 'El archivo se descargará en breve',
    });
  };

  const reportCategories = [
    {
      title: 'Reportes de Proyectos',
      description: 'Exporta información detallada sobre proyectos en curso',
      badge: '8 proyectos',
      actions: [
        { label: 'Excel', onClick: handleExportProjectsExcel },
        { label: 'PDF', onClick: handleExportProjectsPDF },
      ],
    },
    {
      title: 'Reportes de Beneficiarios',
      description: 'Exporta datos de niños beneficiarios y su progreso',
      badge: '243 niños',
      actions: [
        { label: 'Excel', onClick: handleExportBeneficiariesExcel },
        { label: 'PDF', onClick: handleExportBeneficiariesPDF },
      ],
    },
    {
      title: 'Reporte Consolidado',
      description: 'Reporte completo con todas las métricas y estadísticas',
      badge: 'Todas las sedes',
      actions: [
        { label: 'Generar', onClick: handleExportConsolidated },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Reportes y Estadísticas</h2>
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filtros Avanzados
        </Button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCategories.map((category, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <FileText className="w-8 h-8 text-primary" />
                <Badge variant="secondary">{category.badge}</Badge>
              </div>
              <CardTitle className="text-lg">{category.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {category.description}
              </p>
              <div className="flex gap-2">
                {category.actions.map((action, actionIndex) => (
                  <Button
                    key={actionIndex}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={action.onClick}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-foreground">243</div>
            <p className="text-sm text-muted-foreground">Niños Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-foreground">8</div>
            <p className="text-sm text-muted-foreground">Proyectos en Curso</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-foreground">3</div>
            <p className="text-sm text-muted-foreground">Sedes Activas</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
