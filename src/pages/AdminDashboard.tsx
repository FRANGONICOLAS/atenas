import { Link, useLocation } from 'react-router-dom';
import { Menu, Globe, Heart, ChevronDown, Target, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const navLinks = [
    { href: '/', label: t.nav.home },
    { href: '/categorias', label: t.nav.categories },
    { href: '/jugadores', label: t.nav.players },
    { href: '/proyectos', label: t.nav.projects },
    { href: '/galeria', label: t.nav.gallery },
    { href: '/testimonios', label: t.nav.testimonials },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isAboutActive = location.pathname === '/quienes-somos' || location.pathname === '/que-hacemos' || location.pathname === '/sedes';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:block">
              Fundación Sociodeportiva Atenas
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              to="/"
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                isActive('/') ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {t.nav.home}
            </Link>
            
            {/* About Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  'text-sm font-medium transition-all hover:text-primary flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-primary/5 group',
                  isAboutActive ? 'text-primary bg-primary/10' : 'text-muted-foreground'
                )}
              >
                {t.nav.about}
                <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                className="w-56 mt-2 p-2 bg-card border border-border shadow-lg rounded-lg"
              >
                <DropdownMenuItem asChild>
                  <Link 
                    to="/quienes-somos" 
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors',
                      isActive('/quienes-somos')
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-primary/5 text-foreground'
                    )}
                  >
                    <Users className="w-4 h-4" />
                    <span>Quiénes Somos</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    to="/que-hacemos" 
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors',
                      isActive('/que-hacemos')
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-primary/5 text-foreground'
                    )}
                  >
                    <Target className="w-4 h-4" />
                    <span>{t.nav.whatWeDo}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    to="/sedes" 
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors',
                      isActive('/sedes')
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-primary/5 text-foreground'
                    )}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>{t.nav.locations}</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {navLinks.slice(1).map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  isActive(link.href) ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="gap-1"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{language.toUpperCase()}</span>
            </Button>

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  {t.nav.login}
                </Button>
              </Link>
              <Link to="/donar">
                <Button size="sm" className="gap-1">
                  <Heart className="w-4 h-4" />
                  {t.nav.donate}
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive('/')
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                {t.nav.home}
              </Link>
              
              {/* About Section in Mobile */}
              <div className="px-4 py-2">
                <div className={cn(
                  'text-sm font-medium mb-2',
                  isAboutActive ? 'text-primary' : 'text-foreground'
                )}>
                  {t.nav.about}
                </div>
                <div className="flex flex-col gap-1 ml-4">
                  <Link
                    to="/quienes-somos"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'px-4 py-2 rounded-md text-sm transition-colors',
                      isActive('/quienes-somos')
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground'
                    )}
                  >
                    {t.nav.about}
                  </Link>
                  <Link
                    to="/que-hacemos"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'px-4 py-2 rounded-md text-sm transition-colors',
                      isActive('/que-hacemos')
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground'
                    )}
                  >
                    {t.nav.whatWeDo}
                  </Link>
                  <Link
                    to="/sedes"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'px-4 py-2 rounded-md text-sm transition-colors',
                      isActive('/sedes')
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground'
                    )}
                  >
                    {t.nav.locations}
                  </Link>
                </div>
              </div>

              {navLinks.slice(1).map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive(link.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-2 mt-4 px-4">
                <Link to="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">
                    {t.nav.login}
                  </Button>
                </Link>
                <Link to="/donar" className="flex-1" onClick={() => setIsOpen(false)}>
                  <Button className="w-full gap-1">
                    <Heart className="w-4 h-4" />
                    {t.nav.donate}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

import { useState, useEffect } from 'react';
import { 
  Users, 
  Trophy, 
  DollarSign, 
  BarChart3, 
  Settings, 
  Shield,
  UserPlus,
  Edit,
  Trash2,
  Search,
  Download,
  Filter,
  MoreVertical,
  Upload,
  Image as ImageIcon,
  Video,
  FileText,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { userService } from '@/api/services/user.service';
import type { User as DBUser } from '@/api/types/database.types';
import { client } from '@/api/supabase/client';
import {
  generateUsersExcel,
  generateUsersPDF,
  generateDonationsExcel,
  generateDonationsPDF,
  generateConsolidatedExcel,
  type UserReport,
  type DonationReport,
} from '@/lib/reportGenerator';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<DBUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [editingUser, setEditingUser] = useState<DBUser | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Array<{role_id: string; role_name: string}>>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [userForm, setUserForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    birthdate: '',
    phone: '',
  });
  const [contentForm, setContentForm] = useState({
    type: 'image' as 'image' | 'video' | 'text',
    title: '',
    description: '',
    url: '',
    section: 'gallery' as 'gallery' | 'testimonials' | 'about' | 'projects',
  });

  // Load users and roles from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingUsers(true);
        const [usersData, rolesData] = await Promise.all([
          userService.getAll(),
          client.from('role').select('role_id, role_name')
        ]);
        
        setUsers(usersData);
        if (rolesData.data) {
          setAvailableRoles(rolesData.data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Error al cargar datos', {
          description: 'No se pudieron cargar los datos de la base de datos',
        });
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadData();
  }, []);

  // Calculate stats from real data
  const stats = [
    { 
      icon: Users, 
      title: 'Total Usuarios', 
      value: users.length.toString(), 
      change: '+0', 
      color: 'bg-blue-500' 
    },
    { icon: Trophy, title: 'Jugadores Activos', value: '0', change: '+0', color: 'bg-green-500' },
    { icon: DollarSign, title: 'Donaciones Este Mes', value: '$0', change: '+0%', color: 'bg-yellow-500' },
    { icon: BarChart3, title: 'Proyectos Activos', value: '0', change: '+0', color: 'bg-purple-500' },
  ];

  const recentDonations = [
    { id: 1, donor: 'Pedro Silva', amount: 500000, project: 'Cancha Sintética', date: '2024-12-08' },
    { id: 2, donor: 'Laura Torres', amount: 250000, project: 'Becas Académicas', date: '2024-12-07' },
    { id: 3, donor: 'Diego Ramírez', amount: 1000000, project: 'Inversión Libre', date: '2024-12-06' },
  ];

  // User CRUD handlers
  const handleCreateUser = () => {
    setEditingUser(null);
    setSelectedRoles(['donator']); // Default role for new users
    setUserForm({
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      birthdate: '',
      phone: '',
    });
    setShowUserDialog(true);
  };

  const handleEditUser = async (user: DBUser) => {
    setEditingUser(user);
    setUserForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      username: user.username,
      email: user.email,
      birthdate: user.birthdate || '',
      phone: user.phone || '',
    });
    
    // Load user roles
    try {
      const roles = await userService.getUserRoles(user.id);
      setSelectedRoles(roles);
    } catch (error) {
      console.error('Error loading user roles:', error);
      setSelectedRoles([]);
    }
    
    setShowUserDialog(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await userService.delete(userId);
      setUsers(users.filter(u => u.id !== userId));
      toast.success('Usuario eliminado', {
        description: 'El usuario ha sido eliminado correctamente',
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error al eliminar usuario', {
        description: 'No se pudo eliminar el usuario',
      });
    }
  };

  const handleSaveUser = async () => {
    if (!userForm.first_name || !userForm.last_name || !userForm.username || !userForm.email) {
      toast.error('Campos requeridos', {
        description: 'Por favor completa todos los campos obligatorios',
      });
      return;
    }

    try {
      if (editingUser) {
        // Update user info
        const updated = await userService.update(editingUser.id, {
          first_name: userForm.first_name,
          last_name: userForm.last_name,
          username: userForm.username,
          birthdate: userForm.birthdate || null,
          phone: userForm.phone || null,
        });
        
        // Update roles: delete old ones and insert new ones
        await client.from('user_role').delete().eq('user_id', editingUser.id);
        
        if (selectedRoles.length > 0) {
          const roleInserts = selectedRoles.map(role_id => ({
            user_id: editingUser.id,
            role_id: role_id
          }));
          await client.from('user_role').insert(roleInserts);
        }
        
        // Reload users to get updated roles
        const refreshedUsers = await userService.getAll();
        setUsers(refreshedUsers);
        
        toast.success('Usuario actualizado', {
          description: `${userForm.first_name} ${userForm.last_name} ha sido actualizado correctamente`,
        });
      } else {
        // Creating users directly is not supported
        // Users must register through the registration flow first
        toast.error('Creación no disponible', {
          description: 'Los usuarios deben registrarse primero a través del formulario de registro. Desde aquí solo puedes editar usuarios existentes.',
        });
        return;
      }
      
      setShowUserDialog(false);
      setEditingUser(null);
      setSelectedRoles([]);
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Error al guardar usuario', {
        description: 'No se pudo guardar el usuario',
      });
    }
  };

  const handleManageContent = () => {
    setContentForm({
      type: 'image',
      title: '',
      description: '',
      url: '',
      section: 'gallery',
    });
    setShowContentDialog(true);
  };

  const handleUploadContent = () => {
    if (!contentForm.title || !contentForm.url) {
      toast.error('Campos requeridos', {
        description: 'Por favor completa título y URL',
      });
      return;
    }

    toast.success('Contenido subido', {
      description: `${contentForm.title} ha sido agregado a ${contentForm.section}`,
    });
    setShowContentDialog(false);
  };

  const handleOpenConfig = () => {
    setShowConfigDialog(true);
  };

  const handleExportUsersExcel = () => {
    const reportData: UserReport[] = users.map((u, index) => ({
      id: index + 1,
      name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
      email: u.email,
      role: (u.roles && u.roles.length > 0 ? u.roles[0].toUpperCase() : 'DONATOR'),
      status: 'Activo',
      date: u.created_at ? u.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    }));

    generateUsersExcel(reportData, 'reporte_usuarios');
    toast.success('Reporte de usuarios generado', {
      description: 'El archivo Excel se ha descargado correctamente',
    });
  };

  const handleExportUsersPDF = () => {
    const reportData: UserReport[] = users.map((u, index) => ({
      id: index + 1,
      name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
      email: u.email,
      role: (u.roles && u.roles.length > 0 ? u.roles[0].toUpperCase() : 'DONATOR'),
      status: 'Activo',
      date: u.created_at ? u.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    }));

    generateUsersPDF(reportData, 'reporte_usuarios');
    toast.success('Reporte de usuarios generado', {
      description: 'El archivo PDF se ha descargado correctamente',
    });
  };

  const handleExportDonationsExcel = () => {
    const reportData: DonationReport[] = recentDonations.map(d => ({
      id: d.id,
      donor: d.donor,
      amount: d.amount,
      project: d.project,
      date: d.date,
      status: 'Completado',
    }));

    generateDonationsExcel(reportData, 'reporte_donaciones');
    toast.success('Reporte de donaciones generado', {
      description: 'El archivo Excel se ha descargado correctamente',
    });
  };

  const handleExportDonationsPDF = () => {
    const reportData: DonationReport[] = recentDonations.map(d => ({
      id: d.id,
      donor: d.donor,
      amount: d.amount,
      project: d.project,
      date: d.date,
      status: 'Completado',
    }));

    generateDonationsPDF(reportData, 'reporte_donaciones');
    toast.success('Reporte de donaciones generado', {
      description: 'El archivo PDF se ha descargado correctamente',
    });
  };

  const handleExportConsolidated = () => {
    const userReports: UserReport[] = users.map((u, index) => ({
      id: index + 1,
      name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
      email: u.email,
      role: (u.roles && u.roles.length > 0 ? u.roles[0].toUpperCase() : 'DONATOR'),
      status: 'Activo',
      date: u.created_at ? u.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    }));

    const donationReports: DonationReport[] = recentDonations.map(d => ({
      id: d.id,
      donor: d.donor,
      amount: d.amount,
      project: d.project,
      date: d.date,
      status: 'Completado',
    }));

    generateConsolidatedExcel(donationReports, userReports, [], 'reporte_consolidado');
    toast.success('Reporte consolidado generado', {
      description: 'El archivo Excel con todas las hojas se ha descargado correctamente',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen pt-20 bg-background">
      {/* Header */}
      <div className="bg-primary py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-foreground mb-2">
                Panel de Administración
              </h1>
              <p className="text-primary-foreground/80">
                Bienvenido, {user?.first_name} {user?.last_name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary-foreground" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {stat.change}
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Button 
              onClick={() => {
                toast.info('Registro de usuarios', {
                  description: 'Los usuarios deben registrarse a través del formulario de registro. Aquí solo puedes editar usuarios existentes.',
                });
              }} 
              variant="outline"
              className="gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Nuevo Usuario
            </Button>
            <Button variant="outline" onClick={handleManageContent} className="gap-2">
              <Upload className="w-4 h-4" />
              Gestionar Contenido
            </Button>
            <Button variant="outline" onClick={handleOpenConfig} className="gap-2">
              <Settings className="w-4 h-4" />
              Configuración
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Exportar Datos
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportUsersExcel}>
                  Usuarios (Excel)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportUsersPDF}>
                  Usuarios (PDF)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportDonationsExcel}>
                  Donaciones (Excel)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportDonationsPDF}>
                  Donaciones (PDF)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportConsolidated}>
                  Reporte Consolidado (Excel)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="users">Usuarios</TabsTrigger>
              <TabsTrigger value="donations">Donaciones</TabsTrigger>
              <TabsTrigger value="analytics">Analíticas</TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Gestión de Usuarios</CardTitle>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar usuarios..."
                          className="pl-10 w-64"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha Registro</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingUsers ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                              <span className="text-muted-foreground">Cargando usuarios...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="text-muted-foreground">
                              <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
                              <p>No hay usuarios registrados</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : users.filter(u => {
                        const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
                        const username = u.username.toLowerCase();
                        const email = u.email.toLowerCase();
                        const term = searchTerm.toLowerCase();
                        return fullName.includes(term) || username.includes(term) || email.includes(term);
                      }).map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">
                            {u.first_name || ''} {u.last_name || ''}
                            <div className="text-xs text-muted-foreground">@{u.username}</div>
                          </TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {u.roles && u.roles.length > 0 ? u.roles[0].toUpperCase() : 'DONATOR'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">Activo</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(u.created_at).toLocaleDateString('es-CO')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleEditUser(u)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteUser(u.id)}
                              >
                                <Trash2 className="w-4 h-4" />
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

            {/* Donations Tab */}
            <TabsContent value="donations">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Donaciones Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Donante</TableHead>
                        <TableHead>Proyecto</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead>Fecha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentDonations.map((donation) => (
                        <TableRow key={donation.id}>
                          <TableCell className="font-medium">{donation.donor}</TableCell>
                          <TableCell>{donation.project}</TableCell>
                          <TableCell className="text-right font-semibold text-green-600">
                            {formatCurrency(donation.amount)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{donation.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Métricas Mensuales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Nuevos Usuarios</span>
                        <span className="text-2xl font-bold text-blue-600">+12</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Donaciones Procesadas</span>
                        <span className="text-2xl font-bold text-green-600">48</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Proyectos Completados</span>
                        <span className="text-2xl font-bold text-purple-600">3</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Actividad del Sistema</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">Sistema funcionando correctamente</div>
                          <div className="text-xs text-muted-foreground">Última actualización: Hace 5 min</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">Backup programado</div>
                          <div className="text-xs text-muted-foreground">Próximo: Hoy 23:00</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* User CRUD Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </DialogTitle>
            <DialogDescription>
              {editingUser ? 'Modifica la información del usuario' : 'Completa el formulario para crear un nuevo usuario'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nombre *</Label>
                <Input
                  id="first_name"
                  value={userForm.first_name}
                  onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })}
                  placeholder="Juan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Apellido *</Label>
                <Input
                  id="last_name"
                  value={userForm.last_name}
                  onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })}
                  placeholder="Pérez"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={userForm.username}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  placeholder="juanperez"
                  disabled={!!editingUser}
                />
                {editingUser && (
                  <p className="text-xs text-muted-foreground">No se puede modificar</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="juan@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthdate">Fecha de Nacimiento</Label>
                <Input
                  id="birthdate"
                  type="date"
                  value={userForm.birthdate}
                  onChange={(e) => setUserForm({ ...userForm, birthdate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  placeholder="+57 300 123 4567"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div>
                <Label className="text-base font-semibold">Roles del Usuario</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {editingUser 
                    ? 'Gestiona los permisos del usuario asignando roles' 
                    : 'Selecciona los roles iniciales (se aplicarán después del registro)'}
                </p>
              </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Left column: Add role selector */}
                  <div className="space-y-2">
                    <Label htmlFor="role-select">Agregar Rol</Label>
                    <Select
                      value=""
                      onValueChange={(value) => {
                        if (value && !selectedRoles.includes(value)) {
                          setSelectedRoles([...selectedRoles, value]);
                        }
                      }}
                    >
                      <SelectTrigger id="role-select">
                        <SelectValue placeholder="Selecciona un rol..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem
                            key={role.role_id}
                            value={role.role_id}
                            disabled={selectedRoles.includes(role.role_id)}
                          >
                            <span className="capitalize">{role.role_name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Right column: Display selected roles as badges */}
                  <div className="space-y-2">
                    <Label>Roles Asignados</Label>
                    {selectedRoles.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedRoles.map((roleId) => {
                          const role = availableRoles.find(r => r.role_id === roleId);
                          return (
                            <Badge key={roleId} variant="secondary" className="gap-1">
                              <span className="capitalize">{role?.role_name || roleId}</span>
                              <button
                                type="button"
                                onClick={() => setSelectedRoles(selectedRoles.filter(r => r !== roleId))}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                        Sin roles asignados
                      </div>
                    )}
                  </div>
                </div>

              {selectedRoles.length === 0 && (
                <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
                  <AlertCircle className="w-4 h-4" />
                  El usuario debe tener al menos un rol asignado
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSaveUser}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {editingUser ? 'Actualizar' : 'Crear'} Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Content Management Dialog */}
      <Dialog open={showContentDialog} onOpenChange={setShowContentDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Gestión de Contenido Multimedia
            </DialogTitle>
            <DialogDescription>
              Sube y administra imágenes, videos y contenido textual del sitio web
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contentType">Tipo de Contenido *</Label>
                <Select
                  value={contentForm.type}
                  onValueChange={(value: 'image' | 'video' | 'text') =>
                    setContentForm({ ...contentForm, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Imagen
                      </div>
                    </SelectItem>
                    <SelectItem value="video">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Video
                      </div>
                    </SelectItem>
                    <SelectItem value="text">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Texto
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="section">Sección *</Label>
                <Select
                  value={contentForm.section}
                  onValueChange={(value: 'gallery' | 'testimonials' | 'about' | 'projects') =>
                    setContentForm({ ...contentForm, section: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gallery">Galería</SelectItem>
                    <SelectItem value="testimonials">Testimonios</SelectItem>
                    <SelectItem value="about">Quiénes Somos</SelectItem>
                    <SelectItem value="projects">Proyectos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={contentForm.title}
                onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                placeholder="Título descriptivo del contenido"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL/Archivo *</Label>
              <div className="flex gap-2">
                <Input
                  id="url"
                  value={contentForm.url}
                  onChange={(e) => setContentForm({ ...contentForm, url: e.target.value })}
                  placeholder="https://example.com/image.jpg o subir archivo"
                />
                <Button variant="outline" size="icon">
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={contentForm.description}
                onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
                placeholder="Describe el contenido (opcional)"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContentDialog(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleUploadContent}>
              <Upload className="w-4 h-4 mr-2" />
              Subir Contenido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuración del Sistema
            </DialogTitle>
            <DialogDescription>
              Gestiona la configuración de módulos y preferencias del sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Módulos del Sistema</h3>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        <span className="font-medium">Autenticación</span>
                      </div>
                      <Badge variant="default">Activo</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Sistema de login y gestión de usuarios
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        <span className="font-medium">Donaciones</span>
                      </div>
                      <Badge variant="default">Activo</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Procesamiento de pagos y donaciones
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        <span className="font-medium">Proyectos</span>
                      </div>
                      <Badge variant="default">Activo</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Gestión de proyectos e inversiones
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        <span className="font-medium">Beneficiarios</span>
                      </div>
                      <Badge variant="default">Activo</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Registro y seguimiento de beneficiarios
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        <span className="font-medium">Testimonios</span>
                      </div>
                      <Badge variant="default">Activo</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Gestión de testimonios públicos
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        <span className="font-medium">Reportes</span>
                      </div>
                      <Badge variant="default">Activo</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Generación de reportes y analíticas
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Configuración General</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">Modo Mantenimiento</div>
                    <div className="text-xs text-muted-foreground">Deshabilitar acceso público temporal</div>
                  </div>
                  <Badge variant="outline">Desactivado</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">Notificaciones Email</div>
                    <div className="text-xs text-muted-foreground">Enviar emails automáticos</div>
                  </div>
                  <Badge variant="default">Activado</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">Backup Automático</div>
                    <div className="text-xs text-muted-foreground">Respaldo diario a las 23:00</div>
                  </div>
                  <Badge variant="default">Activado</Badge>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              Cerrar
            </Button>
            <Button onClick={() => {
              toast.success('Configuración guardada', {
                description: 'Los cambios han sido aplicados correctamente',
              });
              setShowConfigDialog(false);
            }}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
