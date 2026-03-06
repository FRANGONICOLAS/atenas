import { Trophy, MapPin, ClipboardList, Award, Box, UserCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import { DashboardHeader } from '@/components/common/DashboardHeader';
import {
  StatCard,
} from './components';
import { LocationsPage, ReportsPage, ProjectsPage, BeneficiariesPage, HeadquartersPage } from './pages';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types';
import { useBeneficiaries } from '@/hooks/useBeneficiaries';
import { useProjects } from '@/hooks/useProjects';
import { useHeadquarters } from '@/hooks/useHeadquarters';
import { useMemo } from 'react';

const DirectorView = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');

  // Si hay un tab específico, renderizar la página correspondiente
  if (tab === 'locations') {
    return <LocationsPage />;
  }

  if (tab === 'reports') {
    return <ReportsPage />;
  }

  if (tab === 'projects') {
    return <ProjectsPage />;
  }

  if (tab === 'beneficiaries') {
    return <BeneficiariesPage />;
  }

  if (tab === 'headquarters') {
    return <HeadquartersPage />;
  }

  // Dashboard principal (sin tab)
  return <MainDashboard user={user as unknown as User} />;
};

const MainDashboard = ({ user }: { user: User }) => {
  // Cargar datos reales
  const { beneficiaries, loading: beneficiariesLoading } = useBeneficiaries();
  const { projects, projectsLoading } = useProjects();
  const { headquarters, loading: headquartersLoading } = useHeadquarters();

  // Calcular estadísticas reales
  const stats = useMemo(() => {
    const activeBeneficiaries = beneficiaries.filter((b) => b.status === 'activo').length;
    const activeProjects = projects.filter((p) => p.status === 'active').length;
    const totalHeadquarters = headquarters.length;
    
    // Logros del mes: beneficiarios registrados en el mes actual
    const currentMonth = new Date().getMonth();
    const achievementsThisMonth = beneficiaries.filter((b) => {
      if (!b.registry_date) return false;
      const registryDate = new Date(b.registry_date);
      return registryDate.getMonth() === currentMonth;
    }).length;

    return [
      {
        icon: Trophy,
        title: 'Niños Activos',
        value: activeBeneficiaries.toString(),
        color: 'bg-green-500',
      },
      { 
        icon: MapPin, 
        title: 'Sedes a Cargo', 
        value: totalHeadquarters.toString(), 
        color: 'bg-blue-500' 
      },
      {
        icon: ClipboardList,
        title: 'Proyectos Activos',
        value: activeProjects.toString(),
        color: 'bg-purple-500',
      },
      {
        icon: Award,
        title: 'Logros del Mes',
        value: achievementsThisMonth.toString(),
        color: 'bg-yellow-500',
      },
    ];
  }, [beneficiaries, projects, headquarters]);

  // Preparar datos de sedes con estadísticas
  const sedesResumen = useMemo(() => {
    return headquarters.map((sede) => {
      const sedeBeneficiaries = beneficiaries.filter(
        (b) => b.headquarters_id === sede.headquarters_id
      );
      const players = sedeBeneficiaries.length;
      const capacity = 100; // Capacidad estándar
      const utilization = capacity > 0 ? Math.round((players / capacity) * 100) : 0;

      return {
        id: sede.headquarters_id,
        name: sede.name,
        players,
        capacity,
        utilization: Math.min(utilization, 100),
        status: sede.status as 'active' | 'inactive' | 'maintenance',
      };
    });
  }, [headquarters, beneficiaries]);

  // Proyectos destacados (top 3 por progreso)
  const proyectosDestacados = useMemo(() => {
    return projects
      .filter((p) => p.status === 'active')
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 3)
      .map((p) => ({
        id: p.project_id,
        name: p.name,
        progress: p.progress,
        category: p.category,
        priority: (p.priority || 'medium') as 'high' | 'medium' | 'low',
      }));
  }, [projects]);

  // Próximos eventos (simulados basado en próximas evaluaciones)
  const proximosEventos = useMemo(() => {
    const today = new Date();
    
    // Crear eventos simulados basados en sedes
    return sedesResumen.slice(0, 3).map((sede, index) => ({
      id: index + 1,
      title: index === 0 
        ? `Entrenamiento Categoría ${index + 1} y ${index + 2}` 
        : index === 1 
          ? 'Reunión de Evaluación' 
          : 'Partido Amistoso',
      date: new Date(today.getTime() + (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      location: sede.name,
    }));
  }, [sedesResumen]);

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getPriorityLabel = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
    }
  };

  const isLoading = beneficiariesLoading || projectsLoading || headquartersLoading;

  return (
    <div className="w-full">
      {/* Header */}
      <DashboardHeader
        title="Panel de Dirección"
        firstName={user?.first_name}
        lastName={user?.last_name}
        role={user?.role}
        icon={Box}
        roleIcon={UserCheck}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            color={stat.color}
          />
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Cargando datos...</p>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Sedes Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Resumen de Sedes
                </CardTitle>
                <CardDescription>Estado actual de las sedes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sedesResumen.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay sedes registradas</p>
                ) : (
                  sedesResumen.map((sede) => (
                    <div key={sede.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{sede.name}</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Activa
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{sede.players}/{sede.capacity} jugadores</span>
                        <span>{sede.utilization}%</span>
                      </div>
                      <Progress value={sede.utilization} className="h-2" />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Proyectos Destacados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Proyectos Destacados
                </CardTitle>
                <CardDescription>Proyectos en progreso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {proyectosDestacados.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay proyectos activos</p>
                ) : (
                  proyectosDestacados.map((proyecto) => (
                    <div key={proyecto.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{proyecto.name}</span>
                        <Badge 
                          variant="outline" 
                          className={getPriorityColor(proyecto.priority)}
                        >
                          {getPriorityLabel(proyecto.priority)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{proyecto.category}</span>
                        <span>{proyecto.progress}%</span>
                      </div>
                      <Progress value={proyecto.progress} className="h-2" />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Próximos Eventos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Próximos Eventos
                </CardTitle>
                <CardDescription>Agenda de la semana</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {proximosEventos.map((evento) => (
                  <div key={evento.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-sm">{evento.title}</p>
                      <p className="text-xs text-muted-foreground">{evento.location}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {new Date(evento.date).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default DirectorView;
