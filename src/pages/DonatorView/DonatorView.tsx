import { DollarSign, Heart, Trophy, TrendingUp, Calendar, PiggyBank, Box } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import { DashboardHeader } from '@/components/common/DashboardHeader';
import { DonatorStatCard } from './components';
import { DonationsPage, ProjectsPage } from './pages';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { User } from '@/api/types/database.types';

const DonatorView = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');

  // Si hay un tab específico, renderizar la página correspondiente
  if (tab === 'donations') {
    return <DonationsPage />;
  }

  if (tab === 'projects') {
    return <ProjectsPage />;
  }

  // Dashboard principal (sin tab)
  return <MainDashboard user={user as unknown as User} />;
};

const MainDashboard = ({ user }: { user: User }) => {
  const stats = [
    {
      icon: DollarSign,
      title: 'Total Donado',
      value: '$2,500,000',
      color: 'bg-green-500',
    },
    {
      icon: Trophy,
      title: 'Proyectos Apoyados',
      value: '5',
      color: 'bg-blue-500',
    },
    {
      icon: Heart,
      title: 'Niños Beneficiados',
      value: '43',
      color: 'bg-red-500',
    },
  ];

  // Proyectos apoyados
  const proyectosApoyados = [
    {
      id: 1,
      nombre: 'Torneo Interbarrial',
      donacion: 500000,
      progreso: 75,
      categoria: 'Deportes',
    },
    {
      id: 2,
      nombre: 'Programa Nutrición Infantil',
      donacion: 1000000,
      progreso: 50,
      categoria: 'Salud',
    },
    {
      id: 3,
      nombre: 'Mejora Instalaciones',
      donacion: 1000000,
      progreso: 30,
      categoria: 'Infraestructura',
    },
  ];

  // Donaciones recientes
  const donacionesRecientes = [
    { fecha: '2025-01-05', monto: 200000, proyecto: 'Torneo Interbarrial' },
    { fecha: '2024-12-20', monto: 500000, proyecto: 'Programa Nutrición' },
    { fecha: '2024-12-10', monto: 300000, proyecto: 'Mejora Instalaciones' },
  ];

  // Impacto generado
  const impacto = [
    { metrica: 'Niños con alimentación balanceada', valor: 28 },
    { metrica: 'Participantes en torneos', valor: 15 },
    { metrica: 'Mejoras en infraestructura', valor: 3 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <DashboardHeader
        title="Panel de Donación"
        firstName={user?.first_name}
        lastName={user?.last_name}
        role={user?.roles[0]}
        icon={Box}
        roleIcon={Heart}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {stats.map((stat, index) => (
          <DonatorStatCard
            key={index}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            color={stat.color}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Proyectos Apoyados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Proyectos que Apoyas
            </CardTitle>
            <CardDescription>Estado de tus contribuciones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {proyectosApoyados.map((proyecto) => (
              <div key={proyecto.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{proyecto.nombre}</p>
                    <p className="text-xs text-muted-foreground">{proyecto.categoria}</p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {formatCurrency(proyecto.donacion)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progreso</span>
                  <span>{proyecto.progreso}%</span>
                </div>
                <Progress value={proyecto.progreso} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Historial de Donaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Donaciones Recientes
            </CardTitle>
            <CardDescription>Últimas contribuciones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {donacionesRecientes.map((donacion, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <PiggyBank className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-sm">{donacion.proyecto}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(donacion.fecha).toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0 bg-blue-50 text-blue-700 border-blue-200">
                  {formatCurrency(donacion.monto)}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Impacto Generado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tu Impacto
          </CardTitle>
          <CardDescription>
            Beneficios directos de tus donaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {impacto.map((item, index) => (
              <div key={index} className="text-center space-y-2 p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold text-primary">{item.valor}</p>
                <p className="text-sm text-muted-foreground">{item.metrica}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonatorView;
