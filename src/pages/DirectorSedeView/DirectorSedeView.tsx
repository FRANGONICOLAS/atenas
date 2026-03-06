import { Trophy, TrendingUp, Calendar, Star, Box, UserCheck, Users, Activity } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import { DashboardHeader } from '@/components/common/DashboardHeader';
import { BeneficiariesPage, EvaluationsPage, HeadquarterProjectPage } from './pages';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { User } from '@/types';
import { useSedeMainDashboard } from '@/hooks/useSedeMainDashboard';

const DirectorSedeView = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');

  // Si hay un tab específico, renderizar la página correspondiente
  if (tab === 'beneficiaries') {
    return <BeneficiariesPage />;
  }

  if (tab === 'evaluations') {
    return <EvaluationsPage />;
  }

  if (tab === 'projects') {
    return <HeadquarterProjectPage />;
  }

  // Dashboard principal (sin tab)
  return <MainDashboard user={user as unknown as User} />;
};

const MainDashboard = ({ user }: { user: User }) => {
  const {
    loading,
    assignedHeadquarterName,
    categorySummary,
    topJugadores,
    topCategoryFilter,
    setTopCategoryFilter,
    indicadores,
    availableCategories,
  } = useSedeMainDashboard();

  const maxJugadores = Math.max(...categorySummary.map((c) => c.jugadores), 1);

  return (
    <div className="w-full">
      {/* Header */}
      <DashboardHeader
        title="Panel Director de Sede"
        firstName={user?.first_name}
        lastName={user?.last_name}
        role={user?.role}
        icon={Box}
        roleIcon={UserCheck}
        subtitle={assignedHeadquarterName ?? 'Cargando sede...'}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Estado por Categoría */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Estado por Categoría
            </CardTitle>
            <CardDescription>Distribución de jugadores en la sede</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))
            ) : categorySummary.every((c) => c.jugadores === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay beneficiarios registrados en esta sede.
              </p>
            ) : (
              categorySummary.map((cat) => (
                <div key={cat.categoria} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{cat.categoria}</span>
                    <span className="text-sm text-muted-foreground">
                      {cat.jugadores} jugador{cat.jugadores !== 1 ? 'es' : ''}
                    </span>
                  </div>
                  <Progress
                    value={cat.jugadores === 0 ? 0 : (cat.jugadores / maxJugadores) * 100}
                    className="h-2"
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Indicadores de la Sede */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Indicadores de la Sede
            </CardTitle>
            <CardDescription>Métricas basadas en evaluaciones</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Activity className="h-4 w-4" />
                      Rendimiento Deportivo
                    </span>
                    <span className="text-sm font-bold">{indicadores.avgDeportivo}%</span>
                  </div>
                  <Progress value={indicadores.avgDeportivo} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Beneficiarios Activos
                    </span>
                    <span className="text-sm font-bold">
                      {indicadores.activeBenef}/{indicadores.totalBenef} ({indicadores.pctActivos}%)
                    </span>
                  </div>
                  <Progress value={indicadores.pctActivos} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Cobertura de Evaluaciones
                    </span>
                    <span className="text-sm font-bold">
                      {indicadores.uniqueEvaluated}/{indicadores.totalBenef} ({indicadores.pctEvaluados}%)
                    </span>
                  </div>
                  <Progress value={indicadores.pctEvaluados} className="h-2" />
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground text-right">
                    {indicadores.totalEvaluaciones} evaluación{indicadores.totalEvaluaciones !== 1 ? 'es' : ''} registrada{indicadores.totalEvaluaciones !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Jugadores */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Top Jugadores
                </CardTitle>
                <CardDescription>Mejor rendimiento técnico por evaluación</CardDescription>
              </div>
              <Select value={topCategoryFilter} onValueChange={setTopCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : topJugadores.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                {topCategoryFilter === 'all'
                  ? 'No hay evaluaciones técnicas registradas para esta sede.'
                  : `No hay evaluaciones técnicas para ${topCategoryFilter}.`}
              </p>
            ) : (
              <div className="space-y-3">
                {topJugadores.map((jugador, index) => (
                  <div
                    key={`${jugador.name}-${index}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                      #{index + 1}
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="font-medium text-sm truncate">{jugador.name}</p>
                      <p className="text-xs text-muted-foreground">{jugador.category}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 shrink-0"
                    >
                      {jugador.score}%
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DirectorSedeView;
