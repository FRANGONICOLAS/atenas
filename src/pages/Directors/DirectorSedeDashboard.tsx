import { useState } from 'react';
import { 
  Users, 
  Trophy, 
  UserPlus,
  Edit,
  Trash2,
  Search,
  X,
  CheckCircle2,
  Shield,
  Calendar,
  Phone,
  Mail,
  Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
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
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Player, Coach, CreatePlayerData, CreateCoachData } from '@/api/types/database.types';

const DirectorSedeDashboard = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showPlayerDialog, setShowPlayerDialog] = useState(false);
  const [showCoachDialog, setShowCoachDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('players');
  
  // Mock data para jugadores
  const [players, setPlayers] = useState<Player[]>([
    { 
      id: 1, 
      first_name: 'Santiago', 
      last_name: 'López', 
      birthdate: '2010-05-15',
      category: 'Sub-14',
      position: 'Delantero',
      jersey_number: 10,
      phone: '3001234567',
      emergency_contact: 'María López',
      emergency_phone: '3009876543',
      active: true,
      created_at: '2024-01-15'
    },
    { 
      id: 2, 
      first_name: 'Mario', 
      last_name: 'García', 
      birthdate: '2012-08-22',
      category: 'Sub-12',
      position: 'Mediocampista',
      jersey_number: 8,
      phone: '3002345678',
      emergency_contact: 'Pedro García',
      emergency_phone: '3008765432',
      active: true,
      created_at: '2024-02-20'
    },
  ]);

  // Mock data para entrenadores
  const [coaches, setCoaches] = useState<Coach[]>([
    {
      id: 1,
      first_name: 'Carlos',
      last_name: 'Martínez',
      birthdate: '1985-03-10',
      specialization: 'Preparación Física',
      experience_years: 10,
      phone: '3101234567',
      email: 'carlos.martinez@atenas.com',
      active: true,
      created_at: '2023-06-01'
    },
    {
      id: 2,
      first_name: 'Ana',
      last_name: 'Rodríguez',
      birthdate: '1990-07-25',
      specialization: 'Técnica y Táctica',
      experience_years: 7,
      phone: '3102345678',
      email: 'ana.rodriguez@atenas.com',
      active: true,
      created_at: '2023-08-15'
    },
  ]);

  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);

  const [playerForm, setPlayerForm] = useState<CreatePlayerData>({
    first_name: '',
    last_name: '',
    birthdate: '',
    category: 'Sub-14',
    position: 'Delantero',
    jersey_number: undefined,
    phone: '',
    emergency_contact: '',
    emergency_phone: '',
    active: true,
  });

  const [coachForm, setCoachForm] = useState<CreateCoachData>({
    first_name: '',
    last_name: '',
    birthdate: '',
    specialization: '',
    experience_years: 0,
    phone: '',
    email: '',
    active: true,
  });

  const stats = [
    { icon: Users, title: 'Total Jugadores', value: players.length.toString(), change: '+2', color: 'bg-blue-500' },
    { icon: Trophy, title: 'Entrenadores', value: coaches.length.toString(), change: '+1', color: 'bg-green-500' },
    { icon: Award, title: 'Jugadores Activos', value: players.filter(p => p.active).length.toString(), change: '100%', color: 'bg-yellow-500' },
  ];

  const categories = ['Sub-8', 'Sub-10', 'Sub-12', 'Sub-14', 'Sub-16', 'Sub-18'];
  const positions = ['Portero', 'Defensa', 'Mediocampista', 'Delantero'];
  const specializations = ['Preparación Física', 'Técnica y Táctica', 'Porteros', 'Juveniles', 'General'];

  // Player CRUD handlers
  const handleCreatePlayer = () => {
    setEditingPlayer(null);
    setPlayerForm({
      first_name: '',
      last_name: '',
      birthdate: '',
      category: 'Sub-14',
      position: 'Delantero',
      jersey_number: undefined,
      phone: '',
      emergency_contact: '',
      emergency_phone: '',
      active: true,
    });
    setShowPlayerDialog(true);
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setPlayerForm({
      first_name: player.first_name,
      last_name: player.last_name,
      birthdate: player.birthdate,
      category: player.category,
      position: player.position,
      jersey_number: player.jersey_number,
      phone: player.phone || '',
      emergency_contact: player.emergency_contact || '',
      emergency_phone: player.emergency_phone || '',
      active: player.active,
    });
    setShowPlayerDialog(true);
  };

  const handleDeletePlayer = (playerId: number) => {
    setPlayers(players.filter(p => p.id !== playerId));
    toast.success('Jugador eliminado', {
      description: 'El jugador ha sido eliminado correctamente',
    });
  };

  const handleSavePlayer = () => {
    if (!playerForm.first_name || !playerForm.last_name || !playerForm.birthdate) {
      toast.error('Campos requeridos', {
        description: 'Por favor completa todos los campos obligatorios',
      });
      return;
    }

    if (editingPlayer) {
      setPlayers(players.map(p => p.id === editingPlayer.id ? { ...p, ...playerForm } : p));
      toast.success('Jugador actualizado', {
        description: `${playerForm.first_name} ${playerForm.last_name} ha sido actualizado correctamente`,
      });
    } else {
      const newPlayer: Player = {
        id: Math.max(...players.map(p => p.id)) + 1,
        ...playerForm,
        active: playerForm.active ?? true,
        created_at: new Date().toISOString(),
      };
      setPlayers([...players, newPlayer]);
      toast.success('Jugador creado', {
        description: `${playerForm.first_name} ${playerForm.last_name} ha sido agregado correctamente`,
      });
    }

    setShowPlayerDialog(false);
    setEditingPlayer(null);
  };

  // Coach CRUD handlers
  const handleCreateCoach = () => {
    setEditingCoach(null);
    setCoachForm({
      first_name: '',
      last_name: '',
      birthdate: '',
      specialization: '',
      experience_years: 0,
      phone: '',
      email: '',
      active: true,
    });
    setShowCoachDialog(true);
  };

  const handleEditCoach = (coach: Coach) => {
    setEditingCoach(coach);
    setCoachForm({
      first_name: coach.first_name,
      last_name: coach.last_name,
      birthdate: coach.birthdate,
      specialization: coach.specialization,
      experience_years: coach.experience_years,
      phone: coach.phone,
      email: coach.email || '',
      active: coach.active,
    });
    setShowCoachDialog(true);
  };

  const handleDeleteCoach = (coachId: number) => {
    setCoaches(coaches.filter(c => c.id !== coachId));
    toast.success('Entrenador eliminado', {
      description: 'El entrenador ha sido eliminado correctamente',
    });
  };

  const handleSaveCoach = () => {
    if (!coachForm.first_name || !coachForm.last_name || !coachForm.phone) {
      toast.error('Campos requeridos', {
        description: 'Por favor completa todos los campos obligatorios',
      });
      return;
    }

    if (editingCoach) {
      setCoaches(coaches.map(c => c.id === editingCoach.id ? { ...c, ...coachForm } : c));
      toast.success('Entrenador actualizado', {
        description: `${coachForm.first_name} ${coachForm.last_name} ha sido actualizado correctamente`,
      });
    } else {
      const newCoach: Coach = {
        id: Math.max(...coaches.map(c => c.id)) + 1,
        ...coachForm,
        active: coachForm.active ?? true,
        created_at: new Date().toISOString(),
      };
      setCoaches([...coaches, newCoach]);
      toast.success('Entrenador creado', {
        description: `${coachForm.first_name} ${coachForm.last_name} ha sido agregado correctamente`,
      });
    }

    setShowCoachDialog(false);
    setEditingCoach(null);
  };

  const calculateAge = (birthdate: string) => {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen pt-20 bg-background">
      {/* Header */}
      <div className="bg-primary py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-foreground mb-2">
                Panel Director de Sede
              </h1>
              <p className="text-primary-foreground/80">
                Bienvenido, {user?.first_name} {user?.last_name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary-foreground" />
              <Badge variant="secondary" className="text-sm px-3 py-1">
                DIRECTOR DE SEDE
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="players">Jugadores</TabsTrigger>
              <TabsTrigger value="coaches">Entrenadores</TabsTrigger>
            </TabsList>

            {/* Players Tab */}
            <TabsContent value="players">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Gestión de Jugadores</CardTitle>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar jugadores..."
                          className="pl-10 w-64"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleCreatePlayer} className="gap-2">
                        <UserPlus className="w-4 h-4" />
                        Nuevo Jugador
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Edad</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Posición</TableHead>
                        <TableHead>Dorsal</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {players.filter(p => 
                        p.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.last_name.toLowerCase().includes(searchTerm.toLowerCase())
                      ).map((player) => (
                        <TableRow key={player.id}>
                          <TableCell className="font-medium">
                            {player.first_name} {player.last_name}
                          </TableCell>
                          <TableCell>{calculateAge(player.birthdate)} años</TableCell>
                          <TableCell>
                            <Badge variant="outline">{player.category}</Badge>
                          </TableCell>
                          <TableCell>{player.position}</TableCell>
                          <TableCell>{player.jersey_number || '-'}</TableCell>
                          <TableCell className="text-muted-foreground">{player.phone || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={player.active ? 'default' : 'secondary'}>
                              {player.active ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleEditPlayer(player)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeletePlayer(player.id)}
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

            {/* Coaches Tab */}
            <TabsContent value="coaches">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Gestión de Entrenadores</CardTitle>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar entrenadores..."
                          className="pl-10 w-64"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleCreateCoach} className="gap-2">
                        <UserPlus className="w-4 h-4" />
                        Nuevo Entrenador
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Especialización</TableHead>
                        <TableHead>Experiencia</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coaches.filter(c => 
                        c.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.last_name.toLowerCase().includes(searchTerm.toLowerCase())
                      ).map((coach) => (
                        <TableRow key={coach.id}>
                          <TableCell className="font-medium">
                            {coach.first_name} {coach.last_name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{coach.specialization}</Badge>
                          </TableCell>
                          <TableCell>{coach.experience_years} años</TableCell>
                          <TableCell className="text-muted-foreground">{coach.phone}</TableCell>
                          <TableCell className="text-muted-foreground">{coach.email || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={coach.active ? 'default' : 'secondary'}>
                              {coach.active ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleEditCoach(coach)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteCoach(coach.id)}
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
          </Tabs>
        </div>
      </section>

      {/* Player Dialog */}
      <Dialog open={showPlayerDialog} onOpenChange={setShowPlayerDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              {editingPlayer ? 'Editar Jugador' : 'Nuevo Jugador'}
            </DialogTitle>
            <DialogDescription>
              {editingPlayer ? 'Modifica la información del jugador' : 'Completa el formulario para agregar un nuevo jugador'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="player_first_name">Nombre *</Label>
                <Input
                  id="player_first_name"
                  value={playerForm.first_name}
                  onChange={(e) => setPlayerForm({ ...playerForm, first_name: e.target.value })}
                  placeholder="Santiago"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="player_last_name">Apellido *</Label>
                <Input
                  id="player_last_name"
                  value={playerForm.last_name}
                  onChange={(e) => setPlayerForm({ ...playerForm, last_name: e.target.value })}
                  placeholder="López"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="player_birthdate">Fecha de Nacimiento *</Label>
                <DatePicker
                  date={playerForm.birthdate ? new Date(playerForm.birthdate + 'T12:00:00') : undefined}
                  onDateChange={(date) => {
                    if (date) {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      setPlayerForm({ ...playerForm, birthdate: `${year}-${month}-${day}` });
                    } else {
                      setPlayerForm({ ...playerForm, birthdate: '' });
                    }
                  }}
                  placeholder="Selecciona la fecha"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jersey_number">Número de Dorsal</Label>
                <Input
                  id="jersey_number"
                  type="number"
                  value={playerForm.jersey_number || ''}
                  onChange={(e) => setPlayerForm({ ...playerForm, jersey_number: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={playerForm.category}
                  onValueChange={(value) => setPlayerForm({ ...playerForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Posición *</Label>
                <Select
                  value={playerForm.position}
                  onValueChange={(value) => setPlayerForm({ ...playerForm, position: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((pos) => (
                      <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="player_phone">Teléfono del Jugador</Label>
              <Input
                id="player_phone"
                value={playerForm.phone}
                onChange={(e) => setPlayerForm({ ...playerForm, phone: e.target.value })}
                placeholder="3001234567"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact">Contacto de Emergencia</Label>
                <Input
                  id="emergency_contact"
                  value={playerForm.emergency_contact}
                  onChange={(e) => setPlayerForm({ ...playerForm, emergency_contact: e.target.value })}
                  placeholder="María López"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_phone">Teléfono de Emergencia</Label>
                <Input
                  id="emergency_phone"
                  value={playerForm.emergency_phone}
                  onChange={(e) => setPlayerForm({ ...playerForm, emergency_phone: e.target.value })}
                  placeholder="3009876543"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlayerDialog(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSavePlayer}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {editingPlayer ? 'Actualizar' : 'Crear'} Jugador
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Coach Dialog */}
      <Dialog open={showCoachDialog} onOpenChange={setShowCoachDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              {editingCoach ? 'Editar Entrenador' : 'Nuevo Entrenador'}
            </DialogTitle>
            <DialogDescription>
              {editingCoach ? 'Modifica la información del entrenador' : 'Completa el formulario para agregar un nuevo entrenador'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coach_first_name">Nombre *</Label>
                <Input
                  id="coach_first_name"
                  value={coachForm.first_name}
                  onChange={(e) => setCoachForm({ ...coachForm, first_name: e.target.value })}
                  placeholder="Carlos"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coach_last_name">Apellido *</Label>
                <Input
                  id="coach_last_name"
                  value={coachForm.last_name}
                  onChange={(e) => setCoachForm({ ...coachForm, last_name: e.target.value })}
                  placeholder="Martínez"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coach_birthdate">Fecha de Nacimiento *</Label>
                <DatePicker
                  date={coachForm.birthdate ? new Date(coachForm.birthdate + 'T12:00:00') : undefined}
                  onDateChange={(date) => {
                    if (date) {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      setCoachForm({ ...coachForm, birthdate: `${year}-${month}-${day}` });
                    } else {
                      setCoachForm({ ...coachForm, birthdate: '' });
                    }
                  }}
                  placeholder="Selecciona la fecha"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience_years">Años de Experiencia</Label>
                <Input
                  id="experience_years"
                  type="number"
                  value={coachForm.experience_years || ''}
                  onChange={(e) => setCoachForm({ ...coachForm, experience_years: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Especialización *</Label>
              <Select
                value={coachForm.specialization}
                onValueChange={(value) => setCoachForm({ ...coachForm, specialization: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una especialización" />
                </SelectTrigger>
                <SelectContent>
                  {specializations.map((spec) => (
                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coach_phone">Teléfono *</Label>
                <Input
                  id="coach_phone"
                  value={coachForm.phone}
                  onChange={(e) => setCoachForm({ ...coachForm, phone: e.target.value })}
                  placeholder="3101234567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coach_email">Email</Label>
                <Input
                  id="coach_email"
                  type="email"
                  value={coachForm.email}
                  onChange={(e) => setCoachForm({ ...coachForm, email: e.target.value })}
                  placeholder="carlos@atenas.com"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCoachDialog(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSaveCoach}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {editingCoach ? 'Actualizar' : 'Crear'} Entrenador
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DirectorSedeDashboard;
