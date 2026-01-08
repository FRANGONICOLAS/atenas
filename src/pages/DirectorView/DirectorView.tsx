import { Trophy, MapPin, ClipboardList, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import {
  DirectorHeader,
  StatCard,
} from './components';
import { LocationsPage, ReportsPage, ProjectsPage, BeneficiariesPage, HeadquartersPage } from './pages';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

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
  return <MainDashboard user={user} />;
};

const MainDashboard = ({ user }: { user: any }) => {
  // Stats principales
  const stats = [
    {
      icon: Trophy,
      title: 'Niños Activos',
      value: '243',
      color: 'bg-green-500',
    },
    { 
      icon: MapPin, 
      title: 'Sedes a Cargo', 
      value: '3', 
      color: 'bg-blue-500' 
    },
    {
      icon: ClipboardList,
      title: 'Proyectos Activos',
      value: '8',
      color: 'bg-purple-500',
    },
    {
      icon: Award,
      title: 'Logros del Mes',
      value: '12',
      color: 'bg-yellow-500',
    },
  ];

  // Resumen de sedes
  const sedesResumen = [
    {
      id: 1,
      name: 'Sede Norte',
      players: 87,
      capacity: 100,
      utilization: 87,
      status: 'active',
    },
    {
      id: 2,
      name: 'Sede Centro',
      players: 92,
      capacity: 100,
      utilization: 92,
      status: 'active',
    },
    {
      id: 3,
      name: 'Sede Sur',
      players: 64,
      capacity: 80,
      utilization: 80,
      status: 'active',
    },
  ];

  // Resumen de proyectos destacados
  const proyectosDestacados = [
    {
      id: 1,
      name: 'Torneo Interbarrial',
      progress: 75,
      category: 'Deportes',
      priority: 'high' as 'high' | 'medium' | 'low',
    },
    {
      id: 2,
      name: 'Programa Nutrición Infantil',
      progress: 50,
      category: 'Salud',
      priority: 'medium' as 'high' | 'medium' | 'low',
    },
    {
      id: 3,
      name: 'Mejora Instalaciones',
      progress: 30,
      category: 'Infraestructura',
      priority: 'low' as 'high' | 'medium' | 'low',
    },
  ];

  // Próximos eventos
  const proximosEventos = [
    {
      id: 1,
      title: 'Entrenamiento Categoria 1 y 2',
      date: '2025-01-12',
      location: 'Sede Norte',
    },
    {
      id: 2,
      title: 'Reunión con Padres',
      date: '2025-01-15',
      location: 'Sede Centro',
    },
    {
      id: 3,
      title: 'Partido Amistoso Categoria 5',
      date: '2025-01-20',
      location: 'Sede Sur',
    },
  ];

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

  return (
    <div className="w-full">
      {/* Header */}
      <DirectorHeader
        firstName={user?.first_name}
        lastName={user?.last_name}
        role={user?.role}
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
            {sedesResumen.map((sede) => (
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
            ))}
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
            {proyectosDestacados.map((proyecto) => (
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
            ))}
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

      {/* Indicadores de Rendimiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Indicadores de Rendimiento
          </CardTitle>
          <CardDescription>
            Métricas clave de la fundación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Asistencia Promedio</p>
              <p className="text-3xl font-bold">92%</p>
              <Progress value={92} className="h-2" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Rendimiento Académico</p>
              <p className="text-3xl font-bold">4.2</p>
              <Progress value={84} className="h-2" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Rendimiento Deportivo</p>
              <p className="text-3xl font-bold">85%</p>
              <Progress value={85} className="h-2" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Satisfacción</p>
              <p className="text-3xl font-bold">4.5</p>
              <Progress value={90} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DirectorView;
