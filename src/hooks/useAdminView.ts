import { useState, useEffect, createElement } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';
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

interface ContentForm {
  type: 'image' | 'video' | 'text';
  title: string;
  description: string;
  url: string;
  section: 'gallery' | 'testimonials' | 'about' | 'projects';
}

interface UserForm {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  birthdate: string;
  phone: string;
}

export const useAdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<DBUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [editingUser, setEditingUser] = useState<DBUser | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Array<{role_id: string; role_name: string}>>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [userForm, setUserForm] = useState<UserForm>({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    birthdate: '',
    phone: '',
  });
  const [contentForm, setContentForm] = useState<ContentForm>({
    type: 'image',
    title: '',
    description: '',
    url: '',
    section: 'gallery',
  });

  // Update active tab from URL params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Mock data for donations
  const recentDonations = [
    { id: 1, donor: 'Pedro Silva', amount: 500000, project: 'Cancha Sintética', date: '2024-12-08' },
    { id: 2, donor: 'Laura Torres', amount: 250000, project: 'Becas Académicas', date: '2024-12-07' },
    { id: 3, donor: 'Diego Ramírez', amount: 1000000, project: 'Inversión Libre', date: '2024-12-06' },
  ];

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
      icon: 'Users', 
      title: 'Total Usuarios', 
      value: users.length.toString(), 
      change: '+0', 
      color: 'bg-blue-500' 
    },
    { icon: 'Trophy', title: 'Jugadores Activos', value: '0', change: '+0', color: 'bg-green-500' },
    { icon: 'DollarSign', title: 'Donaciones Este Mes', value: '$0', change: '+0%', color: 'bg-yellow-500' },
    { icon: 'BarChart3', title: 'Proyectos Activos', value: '0', change: '+0', color: 'bg-purple-500' },
  ];

  // User CRUD handlers
  const handleCreateUser = () => {
    setEditingUser(null);
    setSelectedRoles(['donator']);
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
        description: 'El usuario ha sido eliminado correctamente de la base de datos y del sistema de autenticación',
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      const errorMessage = error?.message || 'No se pudo eliminar el usuario';
      toast.error('Error al eliminar usuario', {
        description: errorMessage,
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

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userForm.email)) {
      toast.error('Email inválido', {
        description: 'Por favor ingresa un email válido',
      });
      return;
    }

    // Validar que tenga al menos un rol
    if (selectedRoles.length === 0) {
      toast.error('Rol requerido', {
        description: 'El usuario debe tener al menos un rol asignado',
      });
      return;
    }

    try {
      if (editingUser) {
        // Actualizar usuario existente
        await userService.update(editingUser.id, {
          first_name: userForm.first_name,
          last_name: userForm.last_name,
          username: userForm.username,
          birthdate: userForm.birthdate || null,
          phone: userForm.phone || null,
        });
        
        // Actualizar roles
        await client.from('user_role').delete().eq('user_id', editingUser.id);
        
        if (selectedRoles.length > 0) {
          const roleInserts = selectedRoles.map(role_id => ({
            user_id: editingUser.id,
            role_id: role_id
          }));
          await client.from('user_role').insert(roleInserts);
        }
        
        const refreshedUsers = await userService.getAll();
        setUsers(refreshedUsers);
        
        toast.success('Usuario actualizado', {
          description: `${userForm.first_name} ${userForm.last_name} ha sido actualizado correctamente`,
        });
      } else {
        // Crear nuevo usuario usando Edge Function
        const tempPassword = `Temp${Math.random().toString(36).slice(-8)}!`;
        
        // Obtener la URL de Supabase y la sesión actual
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const { data: { session } } = await client.auth.getSession();
        
        if (!session) {
          toast.error('Sesión expirada', {
            description: 'Por favor inicia sesión nuevamente',
          });
          return;
        }

        // Llamar a la Edge Function
        const response = await fetch(`${supabaseUrl}/functions/v1/admin-create-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            email: userForm.email,
            password: tempPassword,
            username: userForm.username,
            first_name: userForm.first_name,
            last_name: userForm.last_name,
            birthdate: userForm.birthdate || null,
            phone: userForm.phone || null,
            roles: selectedRoles
          })
        });

        const result = await response.json();

        if (!response.ok) {
          if (result.error?.includes('already registered') || result.error?.includes('already exists')) {
            toast.error('Usuario duplicado', {
              description: result.error,
            });
          } else if (result.error?.includes('administradores')) {
            toast.error('Permisos insuficientes', {
              description: 'Solo los administradores pueden crear usuarios',
            });
          } else {
            toast.error('Error al crear usuario', {
              description: result.error || 'No se pudo crear el usuario',
            });
          }
          return;
        }

        // Recargar lista de usuarios
        const refreshedUsers = await userService.getAll();
        setUsers(refreshedUsers);
        
        toast.success('Usuario creado exitosamente', {
          description: `${userForm.first_name} ${userForm.last_name} - Contraseña: ${tempPassword}`,
          duration: 15000,
          action: {
            label: createElement(Copy, { className: 'h-4 w-4' }),
            onClick: () => {
              navigator.clipboard.writeText(tempPassword);
              toast.success('Contraseña copiada', {
                description: tempPassword,
                duration: 3000,
              });
            }
          },
        });
      }
      
      setShowUserDialog(false);
      setEditingUser(null);
      setSelectedRoles([]);
    } catch (error) {
      console.error('Error saving user:', error);
      
      // Manejo de errores específicos
      const err = error as { message?: string; code?: string };
      if (err.message?.includes('duplicate') || err.code === '23505') {
        toast.error('Usuario duplicado', {
          description: 'Ya existe un usuario con ese email o username',
        });
      } else if (err.message?.includes('permission')) {
        toast.error('Permisos insuficientes', {
          description: 'No tienes permisos para realizar esta acción',
        });
      } else {
        toast.error('Error al guardar usuario', {
          description: err.message || 'No se pudo guardar el usuario',
        });
      }
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

  return {
    // State
    searchTerm,
    setSearchTerm,
    showUserDialog,
    setShowUserDialog,
    showContentDialog,
    setShowContentDialog,
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
    
    // Handlers
    handleCreateUser,
    handleEditUser,
    handleDeleteUser,
    handleSaveUser,
    handleManageContent,
    handleUploadContent,
    handleExportUsersExcel,
    handleExportUsersPDF,
    handleExportDonationsExcel,
    handleExportDonationsPDF,
    handleExportConsolidated,
    formatCurrency,
  };
};
