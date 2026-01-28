import { DollarSign, Heart, Trophy, TrendingUp, Calendar, PiggyBank, Box } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDonations } from '@/hooks/useDonations';
import { useSearchParams } from 'react-router-dom';
import { DashboardHeader } from '@/components/common/DashboardHeader';
import { FullScreenLoader } from '@/components/common/FullScreenLoader';
import { DonatorStatCard } from './components';
import { DonationsPage, ProjectsPage } from './pages';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { User } from '@/api/types';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  const { stats, loading, error } = useDonations();

  const formatCurrency = (value: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (loading) {
    return <FullScreenLoader message="Cargando estadísticas de donaciones..." />;
  }

  if (error) {
    return (
      <div className="w-full">
        <DashboardHeader
          title="Panel de Donación"
          firstName={user?.first_name}
          lastName={user?.last_name}
          role={user?.roles[0]}
          icon={Box}
          roleIcon={Heart}
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const statsCards = [
    {
      icon: DollarSign,
      title: 'Total Donado',
      value: formatCurrency(stats?.totalDonated || 0),
      color: 'bg-green-500',
    },
    {
      icon: Trophy,
      title: 'Proyectos Apoyados',
      value: stats?.projectsSupported || 0,
      color: 'bg-blue-500',
    },
    {
      icon: Heart,
      title: 'Niños Beneficiados',
      value: stats?.beneficiariesImpacted || 0,
      color: 'bg-red-500',
    },
  ];

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
        {statsCards.map((stat, index) => (
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
            {stats?.supportedProjects && stats.supportedProjects.length > 0 ? (
              stats.supportedProjects.map((proyecto) => (
                <div key={proyecto.project_id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{proyecto.project_name}</p>
                      <p className="text-xs text-muted-foreground">{proyecto.category}</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {formatCurrency(proyecto.totalDonated)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progreso</span>
                    <span>{proyecto.progress}%</span>
                  </div>
                  <Progress value={proyecto.progress} className="h-2" />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No has apoyado proyectos aún
              </p>
            )}
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
            {stats?.recentDonations && stats.recentDonations.length > 0 ? (
              stats.recentDonations.map((donacion, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <PiggyBank className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-sm">{donacion.project?.name || 'Proyecto'}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(donacion.date).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0 bg-blue-50 text-blue-700 border-blue-200">
                    {formatCurrency(parseFloat(donacion.amount), donacion.currency)}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tienes donaciones recientes
              </p>
            )}
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
            <div className="text-center space-y-2 p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold text-primary">{stats?.beneficiariesImpacted || 0}</p>
              <p className="text-sm text-muted-foreground">Niños beneficiados</p>
            </div>
            <div className="text-center space-y-2 p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold text-primary">{stats?.projectsSupported || 0}</p>
              <p className="text-sm text-muted-foreground">Proyectos apoyados</p>
            </div>
            <div className="text-center space-y-2 p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold text-primary">{stats?.recentDonations?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Donaciones realizadas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonatorView;
