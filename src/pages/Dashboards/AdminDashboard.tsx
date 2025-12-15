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
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { user } = useAuth();
  const {
    searchTerm,
    setSearchTerm,
    showUserDialog,
    setShowUserDialog,
    showContentDialog,
    setShowContentDialog,
    showConfigDialog,
    setShowConfigDialog,
    activeTab,
    setActiveTab,
    users,
    isLoadingUsers,
    editingUser,
    availableRoles,
    selectedRoles,
    setSelectedRoles,
    userForm,
    setUserForm,
    contentForm,
    setContentForm,
    stats,
    recentDonations,
    handleCreateUser,
    handleEditUser,
    handleDeleteUser,
    handleSaveUser,
    handleManageContent,
    handleUploadContent,
    handleOpenConfig,
    handleExportUsersExcel,
    handleExportUsersPDF,
    handleExportDonationsExcel,
    handleExportDonationsPDF,
    handleExportConsolidated,
    formatCurrency,
  } = useAdminDashboard();

  // Icon mapping for stats
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Users,
    Trophy,
    DollarSign,
    BarChart3,
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
                {user?.role.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const IconComponent = iconMap[stat.icon];
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                        {IconComponent && <IconComponent className="w-6 h-6 text-white" />}
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {stat.change}
                      </Badge>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Button 
              onClick={handleCreateUser}
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
                            <div className="flex gap-1 flex-wrap">
                              {u.roles && u.roles.length > 0 ? (
                                u.roles.map((role, idx) => (
                                  <Badge key={idx} variant="outline">
                                    {role.toUpperCase()}
                                  </Badge>
                                ))
                              ) : (
                                <Badge variant="outline">DONATOR</Badge>
                              )}
                            </div>
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
