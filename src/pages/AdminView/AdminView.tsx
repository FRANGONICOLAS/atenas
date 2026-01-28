import { Users, Trophy, DollarSign, BarChart3, Box, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useAdminDashboard } from '@/hooks/useAdminView';
import { useSearchParams } from 'react-router-dom';
import { DashboardHeader } from '@/components/common/DashboardHeader';
import {
  StatCard,
  DonationsView,
  AnalyticsView,
} from './components';
import { UsersPage, ContentPage, SiteContentPage } from './pages';
import { User } from '@/types';

const AdminView = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');

  // Si hay un tab específico, renderizar la página correspondiente
  if (tab === 'users') {
    return <UsersPage />;
  }
  
  if (tab === 'content') {
    return <ContentPage />;
  }
  
  if (tab === 'site-content') {
    return <SiteContentPage />;
  }

  // Dashboard principal (sin tab)
  return <MainDashboard user={user as unknown as User} />;
};

const MainDashboard = ({ user }: { user: User }) => {
  const {
    activeTab,
    setActiveTab,
    stats,
    recentDonations,
    formatCurrency,
  } = useAdminDashboard();

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Users,
    Trophy,
    DollarSign,
    BarChart3,
  };

  return (
    <div className="w-full">
      {/* Header */}
      <DashboardHeader
        title="Panel de Administración"
        firstName={user?.first_name}
        lastName={user?.last_name}
        role={user?.role}
        icon={Box}
        roleIcon={Shield}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => {
          const IconComponent = iconMap[stat.icon];
          return IconComponent ? (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={IconComponent}
              color={stat.color}
              change={stat.change}
            />
          ) : null;
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="donations">Donaciones</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Bienvenido al Panel de Administración</h3>
              <p className="text-muted-foreground">
                Desde aquí puedes gestionar usuarios, contenido, configuración y ver estadísticas del sistema.
                Utiliza el menú lateral para navegar entre las diferentes secciones.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Donations Tab */}
        <TabsContent value="donations">
          <DonationsView
            recentDonations={recentDonations}
            formatCurrency={formatCurrency}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <AnalyticsView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminView;
