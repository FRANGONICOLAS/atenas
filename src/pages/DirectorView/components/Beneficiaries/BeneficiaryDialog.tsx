import { X, Trophy, Target, TrendingUp, Calendar, Award, BookOpen } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Evaluation {
  date: string;
  tecnica: number;
  tactica: number;
  fisica: number;
  psicologica: number;
  comments: string;
}

interface Achievement {
  title: string;
  date: string;
  description: string;
}

interface AcademicProgress {
  subject: string;
  grade: number;
  period: string;
}

interface Beneficiary {
  id: number;
  name: string;
  age: number;
  category: string;
  location: string;
  status: string;
  performance: number;
  attendance: number;
  evaluations?: Evaluation[];
  achievements?: Achievement[];
  academicProgress?: AcademicProgress[];
}

interface BeneficiaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiary: Beneficiary | null;
  formatDate: (date: string) => string;
}

export const BeneficiaryDialog = ({
  isOpen,
  onClose,
  beneficiary,
  formatDate,
}: BeneficiaryDialogProps) => {
  if (!beneficiary) return null;

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "text-green-600";
    if (performance >= 75) return "text-blue-600";
    if (performance >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Activo</Badge>;
      case "pending":
        return <Badge variant="secondary">Pendiente</Badge>;
      case "inactive":
        return <Badge variant="outline">Inactivo</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              {beneficiary.name}
            </span>
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Información General */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Edad</p>
            <p className="font-semibold">{beneficiary.age} años</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Categoría</p>
            <Badge variant="outline">{beneficiary.category}</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Sede</p>
            <p className="font-semibold">{beneficiary.location}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Estado</p>
            {getStatusBadge(beneficiary.status)}
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Rendimiento</span>
                <span className={`font-bold ${getPerformanceColor(beneficiary.performance)}`}>
                  {beneficiary.performance}%
                </span>
              </div>
              <Progress value={beneficiary.performance} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Asistencia</span>
                <span className={`font-bold ${getPerformanceColor(beneficiary.attendance)}`}>
                  {beneficiary.attendance}%
                </span>
              </div>
              <Progress value={beneficiary.attendance} />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="evaluations">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="evaluations">
              <Target className="w-4 h-4 mr-2" />
              Evaluaciones
            </TabsTrigger>
            <TabsTrigger value="achievements">
              <Award className="w-4 h-4 mr-2" />
              Logros
            </TabsTrigger>
            <TabsTrigger value="academic">
              <BookOpen className="w-4 h-4 mr-2" />
              Académico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="evaluations" className="space-y-4">
            {beneficiary.evaluations && beneficiary.evaluations.length > 0 ? (
              beneficiary.evaluations.map((evaluation, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Evaluación</span>
                      <span className="text-muted-foreground">
                        {formatDate(evaluation.date)}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Técnica</span>
                          <span className={getPerformanceColor(evaluation.tecnica)}>
                            {evaluation.tecnica}%
                          </span>
                        </div>
                        <Progress value={evaluation.tecnica} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Táctica</span>
                          <span className={getPerformanceColor(evaluation.tactica)}>
                            {evaluation.tactica}%
                          </span>
                        </div>
                        <Progress value={evaluation.tactica} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Física</span>
                          <span className={getPerformanceColor(evaluation.fisica)}>
                            {evaluation.fisica}%
                          </span>
                        </div>
                        <Progress value={evaluation.fisica} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Psicológica</span>
                          <span className={getPerformanceColor(evaluation.psicologica)}>
                            {evaluation.psicologica}%
                          </span>
                        </div>
                        <Progress value={evaluation.psicologica} />
                      </div>
                      {evaluation.comments && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            {evaluation.comments}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay evaluaciones disponibles
              </div>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-3">
            {beneficiary.achievements && beneficiary.achievements.length > 0 ? (
              beneficiary.achievements.map((achievement, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-yellow-500 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {achievement.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(achievement.date)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay logros registrados
              </div>
            )}
          </TabsContent>

          <TabsContent value="academic" className="space-y-3">
            {beneficiary.academicProgress && beneficiary.academicProgress.length > 0 ? (
              beneficiary.academicProgress.map((progress, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-blue-500" />
                        <div>
                          <h4 className="font-semibold">{progress.subject}</h4>
                          <p className="text-sm text-muted-foreground">{progress.period}</p>
                        </div>
                      </div>
                      <div className={`text-2xl font-bold ${getPerformanceColor(progress.grade)}`}>
                        {progress.grade.toFixed(1)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay información académica disponible
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
