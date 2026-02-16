import { Trophy, TrendingUp, Calendar, Star, Box, UserCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import { DashboardHeader } from '@/components/common/DashboardHeader';
import { BeneficiariesPage, EvaluationsPage, SedeReportsPage } from './pages';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types';

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

  if (tab === 'reports') {
    return <SedeReportsPage />;
  }

  // Dashboard principal (sin tab)
  return <MainDashboard user={user as unknown as User} />;
};

const MainDashboard = ({ user }: { user: User }) => {

  // Categorías resumen
  const categoriasResumen = [
    { categoria: 'Categoría 1', jugadores: 8, capacidad: 10 },
    { categoria: 'Categoría 2', jugadores: 10, capacidad: 12 },
    { categoria: 'Categoría 3', jugadores: 12, capacidad: 12 },
    { categoria: 'Categoría 4', jugadores: 9, capacidad: 10 },
    { categoria: 'Categoría 5', jugadores: 6, capacidad: 8 },
  ];

  // Próximas actividades
  const proximasActividades = [
    {
      id: 1,
      titulo: 'Entrenamiento Técnico',
      fecha: '2025-01-08',
      categoria: 'Categoría 3',
    },
    {
      id: 2,
      titulo: 'Evaluación Física',
      fecha: '2025-01-10',
      categoria: 'Categoría 4',
    },
    {
      id: 3,
      titulo: 'Partido Amistoso',
      fecha: '2025-01-12',
      categoria: 'Categoría 5',
    },
  ];

  // Top jugadores
  const topJugadores = [
    { nombre: 'Miguel Ángel Castro', rendimiento: 92, categoria: 'Categoría 4' },
    { nombre: 'Sofía Morales', rendimiento: 90, categoria: 'Categoría 3' },
    { nombre: 'Carlos Mendoza', rendimiento: 88, categoria: 'Categoría 2' },
  ];

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
        subtitle="Sede Norte"
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Categorías */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Estado por Categoría
            </CardTitle>
            <CardDescription>Distribución de jugadores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoriasResumen.map((cat, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{cat.categoria}</span>
                  <span className="text-sm text-muted-foreground">
                    {cat.jugadores}/{cat.capacidad}
                  </span>
                </div>
                <Progress value={(cat.jugadores / cat.capacidad) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Próximas Actividades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximas Actividades
            </CardTitle>
            <CardDescription>Agenda de la semana</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {proximasActividades.map((actividad) => (
              <div key={actividad.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-sm">{actividad.titulo}</p>
                  <p className="text-xs text-muted-foreground">{actividad.categoria}</p>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {new Date(actividad.fecha).toLocaleDateString('es-CO', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Indicadores y Top Jugadores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Indicadores de Rendimiento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Indicadores de la Sede
            </CardTitle>
            <CardDescription>Métricas clave</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Asistencia Promedio</span>
                  <span className="text-sm font-bold">94%</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Rendimiento Deportivo</span>
                  <span className="text-sm font-bold">88%</span>
                </div>
                <Progress value={88} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Rendimiento Académico</span>
                  <span className="text-sm font-bold">4.3</span>
                </div>
                <Progress value={86} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Jugadores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Top Jugadores
            </CardTitle>
            <CardDescription>Mejor rendimiento del mes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topJugadores.map((jugador, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                  #{index + 1}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-sm">{jugador.nombre}</p>
                  <p className="text-xs text-muted-foreground">{jugador.categoria}</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {jugador.rendimiento}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DirectorSedeView;
