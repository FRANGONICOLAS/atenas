import { useState } from 'react';
import {
  Heart,
  DollarSign,
  TrendingUp,
  Calendar,
  Award,
  Target,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Gift,
  Users,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  generateDonationsExcel,
  generateDonationsPDF,
  type DonationReport,
} from '@/lib/reportGenerator';

const DonatorDashboard = () => {
  const { user } = useAuth();
  const [showImpactDialog, setShowImpactDialog] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<(typeof myDonations)[0] | null>(null);

  const stats = [
    {
      icon: DollarSign,
      title: 'Total Donado',
      value: '$1,250,000',
      subtitle: 'Desde Oct 2024',
      color: 'bg-green-500',
    },
    {
      icon: Target,
      title: 'Proyectos Apoyados',
      value: '5',
      subtitle: '3 completados',
      color: 'bg-blue-500',
    },
    {
      icon: Users,
      title: 'Niños Impactados',
      value: '87',
      subtitle: 'Directamente',
      color: 'bg-purple-500',
    },
    {
      icon: Award,
      title: 'Impacto Total',
      value: '243',
      subtitle: 'Niños beneficiados',
      color: 'bg-yellow-500',
    },
  ];

  const myDonations = [
    {
      id: 1,
      date: '2024-12-05',
      amount: 500000,
      project: 'Cancha Sintética Sede Norte',
      projectType: 'investment',
      status: 'completed',
      impact: 'Proyecto completado - 87 niños usando nuevas instalaciones',
      progress: 100,
      goal: 5000000,
      raised: 5000000,
    },
    {
      id: 2,
      date: '2024-11-20',
      amount: 250000,
      project: 'Becas Académicas Q4 2024',
      projectType: 'investment',
      status: 'active',
      impact: '15 niños con becas escolares completas',
      progress: 75,
      goal: 2000000,
      raised: 1500000,
    },
    {
      id: 3,
      date: '2024-11-10',
      amount: 300000,
      project: 'Programa Nutrición Infantil',
      projectType: 'investment',
      status: 'active',
      impact: '120 almuerzos nutritivos por semana',
      progress: 60,
      goal: 3000000,
      raised: 1800000,
    },
    {
      id: 4,
      date: '2024-10-25',
      amount: 100000,
      project: 'Inversión Libre',
      projectType: 'free',
      status: 'distributed',
      impact: 'Fondos distribuidos en mejoras operativas',
      progress: 100,
      goal: 0,
      raised: 0,
    },
    {
      id: 5,
      date: '2024-10-15',
      amount: 100000,
      project: 'Torneo Interbarrial 2024',
      projectType: 'investment',
      status: 'completed',
      impact: 'Torneo realizado - 156 niños participaron',
      progress: 100,
      goal: 1500000,
      raised: 1500000,
    },
  ];

  const supportedProjects = [
    {
      id: 1,
      name: 'Cancha Sintética Sede Norte',
      category: 'Infraestructura',
      myContribution: 500000,
      totalRaised: 5000000,
      goal: 5000000,
      status: 'completed',
      beneficiaries: 87,
      lastUpdate: '2024-12-01',
    },
    {
      id: 2,
      name: 'Becas Académicas Q4 2024',
      category: 'Educación',
      myContribution: 250000,
      totalRaised: 1500000,
      goal: 2000000,
      status: 'active',
      beneficiaries: 15,
      lastUpdate: '2024-12-08',
    },
    {
      id: 3,
      name: 'Programa Nutrición Infantil',
      category: 'Salud',
      myContribution: 300000,
      totalRaised: 1800000,
      goal: 3000000,
      status: 'active',
      beneficiaries: 120,
      lastUpdate: '2024-12-07',
    },
    {
      id: 5,
      name: 'Torneo Interbarrial 2024',
      category: 'Deportes',
      myContribution: 100000,
      totalRaised: 1500000,
      goal: 1500000,
      status: 'completed',
      beneficiaries: 156,
      lastUpdate: '2024-11-30',
    },
  ];

  const impactMetrics = [
    {
      category: 'Infraestructura',
      icon: Target,
      description: 'Nueva cancha sintética beneficiando a 87 niños',
      value: '$500,000',
    },
    {
      category: 'Educación',
      icon: Award,
      description: '15 becas escolares completas otorgadas',
      value: '$250,000',
    },
    {
      category: 'Nutrición',
      icon: Heart,
      description: '120 almuerzos nutritivos semanales',
      value: '$300,000',
    },
    {
      category: 'Deportes',
      icon: Users,
      description: 'Torneo con 156 niños participantes',
      value: '$100,000',
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
      completed: { variant: 'default', label: 'Completado' },
      active: { variant: 'secondary', label: 'Activo' },
      distributed: { variant: 'outline', label: 'Distribuido' },
    };
    const { variant, label } = variants[status] || { variant: 'outline', label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const handleViewImpact = (donation: typeof myDonations[0]) => {
    setSelectedDonation(donation);
    setShowImpactDialog(true);
  };

  const handleDownloadReceipt = (donationId: number) => {
    toast.success('Descargando recibo...', {
      description: `Recibo de donación #${donationId}`,
    });
  };

  const handleExportExcel = () => {
    const reportData: DonationReport[] = myDonations.map(d => ({
      id: d.id,
      donor: user?.first_name && user?.last_name 
        ? `${user.first_name} ${user.last_name}` 
        : user?.email || 'Anónimo',
      amount: d.amount,
      project: d.project,
      date: d.date,
      status: d.status === 'completed' ? 'Completado' : d.status === 'active' ? 'Activo' : 'Distribuido',
    }));

    generateDonationsExcel(reportData, 'mis_donaciones');
    toast.success('Reporte Excel generado', {
      description: 'El archivo se ha descargado correctamente',
    });
  };

  const handleExportPDF = () => {
    const reportData: DonationReport[] = myDonations.map(d => ({
      id: d.id,
      donor: user?.first_name && user?.last_name 
        ? `${user.first_name} ${user.last_name}` 
        : user?.email || 'Anónimo',
      amount: d.amount,
      project: d.project,
      date: d.date,
      status: d.status === 'completed' ? 'Completado' : d.status === 'active' ? 'Activo' : 'Distribuido',
    }));

    generateDonationsPDF(reportData, 'mis_donaciones');
    toast.success('Reporte PDF generado', {
      description: 'El archivo se ha descargado correctamente',
    });
  };

  const totalDonated = myDonations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="min-h-screen pt-20 bg-background">
      {/* Header */}
      <div className="bg-primary py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-foreground mb-2">
                Panel de Donador
              </h1>
              <p className="text-primary-foreground/80">
                Bienvenido, {user?.first_name} {user?.last_name}
              </p>
              <p className="text-primary-foreground/70 text-sm mt-1">
                Gracias por tu generosidad y compromiso con nuestra fundación
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-primary-foreground fill-current" />
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {user?.role}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Button onClick={() => (window.location.href = '/donar')} className="gap-2">
              <Gift className="w-4 h-4" />
              Nueva Donación
            </Button>
            <Button variant="outline" onClick={handleExportExcel} className="gap-2">
              <Download className="w-4 h-4" />
              Exportar a Excel
            </Button>
            <Button variant="outline" onClick={handleExportPDF} className="gap-2">
              <Download className="w-4 h-4" />
              Exportar a PDF
            </Button>
            <Button variant="outline" onClick={() => setShowImpactDialog(true)} className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Ver Impacto Total
            </Button>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="donations" className="space-y-6">
            <TabsList>
              <TabsTrigger value="donations">Mis Donaciones</TabsTrigger>
              <TabsTrigger value="projects">Proyectos Apoyados</TabsTrigger>
              <TabsTrigger value="impact">Mi Impacto</TabsTrigger>
            </TabsList>

            {/* Donations Tab */}
            <TabsContent value="donations">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Historial de Donaciones
                    </span>
                    <span className="text-lg font-semibold text-green-600">
                      {formatCurrency(totalDonated)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Proyecto</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myDonations.map((donation) => (
                        <TableRow key={donation.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              {formatDate(donation.date)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{donation.project}</div>
                              <div className="text-xs text-muted-foreground">{donation.impact}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={donation.projectType === 'investment' ? 'default' : 'secondary'}>
                              {donation.projectType === 'investment' ? 'Inversión' : 'Libre'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(donation.amount)}
                          </TableCell>
                          <TableCell>{getStatusBadge(donation.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleViewImpact(donation)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDownloadReceipt(donation.id)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {supportedProjects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{project.name}</CardTitle>
                          <Badge variant="outline">{project.category}</Badge>
                        </div>
                        {getStatusBadge(project.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progreso</span>
                            <span className="font-semibold">
                              {formatCurrency(project.totalRaised)} / {formatCurrency(project.goal)}
                            </span>
                          </div>
                          <Progress value={(project.totalRaised / project.goal) * 100} className="h-2" />
                          <div className="text-xs text-muted-foreground mt-1">
                            {Math.round((project.totalRaised / project.goal) * 100)}% completado
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                          <div>
                            <div className="text-xs text-muted-foreground">Tu Aporte</div>
                            <div className="text-lg font-semibold text-green-600">
                              {formatCurrency(project.myContribution)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {Math.round((project.myContribution / project.totalRaised) * 100)}% del total
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Beneficiarios</div>
                            <div className="text-lg font-semibold flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {project.beneficiaries}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              niños impactados
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Actualizado {formatDate(project.lastUpdate)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Impact Tab */}
            <TabsContent value="impact">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Resumen de Impacto
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {impactMetrics.map((metric, index) => (
                        <div key={index} className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <metric.icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold">{metric.category}</div>
                              <div className="text-sm text-green-600">{metric.value}</div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{metric.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Logros Desbloqueados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />
                        <div>
                          <div className="font-medium">Primera Donación</div>
                          <div className="text-sm text-muted-foreground">Realizada en Oct 2024</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />
                        <div>
                          <div className="font-medium">Donador Constante</div>
                          <div className="text-sm text-muted-foreground">5 donaciones realizadas</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />
                        <div>
                          <div className="font-medium">Generoso</div>
                          <div className="text-sm text-muted-foreground">Más de $1M donado</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />
                        <div>
                          <div className="font-medium">Impacto Directo</div>
                          <div className="text-sm text-muted-foreground">87 niños beneficiados</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Distribución por Categoría
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span>Infraestructura</span>
                          <span className="font-semibold">$500,000</span>
                        </div>
                        <Progress value={40} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span>Nutrición</span>
                          <span className="font-semibold">$300,000</span>
                        </div>
                        <Progress value={24} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span>Educación</span>
                          <span className="font-semibold">$250,000</span>
                        </div>
                        <Progress value={20} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span>Deportes</span>
                          <span className="font-semibold">$100,000</span>
                        </div>
                        <Progress value={8} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span>Inversión Libre</span>
                          <span className="font-semibold">$100,000</span>
                        </div>
                        <Progress value={8} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Impact Dialog */}
      <Dialog open={showImpactDialog} onOpenChange={setShowImpactDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              {selectedDonation ? `Impacto de tu Donación` : 'Tu Impacto Total'}
            </DialogTitle>
            <DialogDescription>
              {selectedDonation
                ? `Detalles del proyecto: ${selectedDonation.project}`
                : 'Resumen completo de tu contribución a la fundación'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDonation ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Tu Donación</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(selectedDonation.amount)}
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Estado</div>
                    <div className="mt-2">{getStatusBadge(selectedDonation.status)}</div>
                  </div>
                </div>

                {selectedDonation.projectType === 'investment' && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Progreso del Proyecto</div>
                    <Progress value={selectedDonation.progress} className="h-3" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                      <span>{formatCurrency(selectedDonation.raised)}</span>
                      <span>{selectedDonation.progress}%</span>
                      <span>{formatCurrency(selectedDonation.goal)}</span>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <div className="font-medium">Impacto Generado</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {selectedDonation.impact}
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleDownloadReceipt(selectedDonation.id)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Recibo
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg">
                    <div className="text-sm opacity-90">Total Donado</div>
                    <div className="text-2xl font-bold">$1,250,000</div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg">
                    <div className="text-sm opacity-90">Niños Impactados</div>
                    <div className="text-2xl font-bold">243</div>
                  </div>
                </div>
                <div className="text-center p-6 bg-muted rounded-lg">
                  <Heart className="w-12 h-12 mx-auto text-primary mb-3" />
                  <h3 className="font-semibold text-lg mb-2">¡Gracias por tu generosidad!</h3>
                  <p className="text-sm text-muted-foreground">
                    Tu contribución ha transformado la vida de 243 niños, brindándoles mejores oportunidades
                    en educación, nutrición, deporte e infraestructura.
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DonatorDashboard;
