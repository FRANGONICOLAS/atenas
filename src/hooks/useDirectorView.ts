import { useState } from 'react';
import { toast } from 'sonner';
import type { 
  Project, 
  ProjectType, 
  ProjectPriority,
  Beneficiary,
  BeneficiaryStatus,
  Headquarter,
  HeadquarterStatus
} from '@/types';

export const useDirectorView = () => {
  // Projects state
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      name: "Torneo Interbarrial",
      category: "Deportes",
      type: "investment",
      goal: 1500000,
      raised: 1125000,
      progress: 75,
      priority: "high",
      deadline: "15 Ene 2025",
      description: "Organización de torneo interbarrial para todas las categorías",
      headquarters_id: 1,
    },
    {
      id: 2,
      name: "Programa Nutrición Infantil",
      category: "Salud",
      type: "investment",
      goal: 3000000,
      raised: 1500000,
      progress: 50,
      priority: "medium",
      deadline: "30 Ene 2025",
      description: "Programa de alimentación balanceada para 120 niños",
      headquarters_id: 3,
    },
    {
      id: 3,
      name: "Mejora Instalaciones",
      category: "Infraestructura",
      type: "investment",
      goal: 5000000,
      raised: 1500000,
      progress: 30,
      priority: "low",
      deadline: "28 Feb 2025",
      description: "Remodelación de instalaciones deportivas en Sede Sur",
      headquarters_id: 2,
    },
  ]);
  const [projectSearch, setProjectSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Beneficiaries state
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    {
      id: 1,
      name: "Miguel Ángel Castro",
      age: 13,
      category: "Categoria 4",
      location: "Sede Norte",
      status: "active",
      performance: 85,
      attendance: 95,
      birthDate: "2011-03-15",
      joinDate: "2022-01-10",
      guardian: "María Castro",
      phone: "315-123-4567",
      address: "Calle 25 #10-45, Cali",
      emergencyContact: "María Castro - 315-123-4567",
      medicalInfo: "Ninguna",
      achievements: [
        {
          date: "2024-11",
          title: "MVP Torneo Interbarrial",
          description: "Mejor jugador del torneo",
        },
      ],
    },
    {
      id: 2,
      name: "Sofía Morales",
      age: 11,
      category: "Categoria 3",
      location: "Sede Centro",
      status: "active",
      performance: 92,
      attendance: 98,
      birthDate: "2013-07-20",
      joinDate: "2021-08-15",
      guardian: "Pedro Morales",
      phone: "310-987-6543",
      address: "Carrera 15 #30-12, Cali",
      emergencyContact: "Pedro Morales - 310-987-6543",
      medicalInfo: "Alergia a la penicilina",
      achievements: [],
    },
  ]);
  const [beneficiarySearch, setBeneficiarySearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [categoryBeneficiaryFilter, setCategoryBeneficiaryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Headquarters state
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([
    {
      id: 1,
      name: "Sede Norte",
      players: 87,
      capacity: 100,
      utilization: 87,
      status: "active",
      address: "Cra 100 #15-20, Cali",
      coordinates: "3.4516, -76.5320",
    },
    {
      id: 2,
      name: "Sede Centro",
      players: 92,
      capacity: 100,
      utilization: 92,
      status: "active",
      address: "Calle 5 #45-12, Cali",
      coordinates: "3.4372, -76.5225",
    },
    {
      id: 3,
      name: "Sede Sur",
      players: 64,
      capacity: 80,
      utilization: 80,
      status: "active",
      address: "Calle 44 #1-50, Cali",
      coordinates: "3.3950, -76.5398",
    },
  ]);
  const [headquarterSearch, setHeadquarterSearch] = useState('');
  const [headquarterStatusFilter, setHeadquarterStatusFilter] = useState('all');

  // Project handlers
  const handleCreateProject = () => {
    toast.info('Crear proyecto', {
      description: 'Funcionalidad en desarrollo',
    });
  };

  const handleEditProject = (project: Project) => {
    toast.info('Editar proyecto', {
      description: `Editando: ${project.name}`,
    });
  };

  const handleDeleteProject = (projectId: number) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    toast.success('Proyecto eliminado');
  };

  const handleSaveProject = (project: Partial<Project>) => {
    if (project.id) {
      setProjects(prev => prev.map(p => p.id === project.id ? { ...p, ...project } as Project : p));
      toast.success('Proyecto actualizado');
    } else {
      const newProject = {
        ...project,
        id: Math.max(...projects.map(p => p.id), 0) + 1,
      } as Project;
      setProjects(prev => [...prev, newProject]);
      toast.success('Proyecto creado');
    }
  };

  // Beneficiary handlers
  const handleCreateBeneficiary = () => {
    toast.info('Crear beneficiario', {
      description: 'Funcionalidad en desarrollo',
    });
  };

  const handleEditBeneficiary = (beneficiary: Beneficiary) => {
    toast.info('Editar beneficiario', {
      description: `Editando: ${beneficiary.name}`,
    });
  };

  const handleDeleteBeneficiary = (beneficiaryId: number) => {
    setBeneficiaries(prev => prev.filter(b => b.id !== beneficiaryId));
    toast.success('Beneficiario eliminado');
  };

  const handleSaveBeneficiary = (beneficiary: Partial<Beneficiary>) => {
    if (beneficiary.id) {
      setBeneficiaries(prev => prev.map(b => b.id === beneficiary.id ? { ...b, ...beneficiary } as Beneficiary : b));
      toast.success('Beneficiario actualizado');
    } else {
      const newBeneficiary = {
        ...beneficiary,
        id: Math.max(...beneficiaries.map(b => b.id), 0) + 1,
      } as Beneficiary;
      setBeneficiaries(prev => [...prev, newBeneficiary]);
      toast.success('Beneficiario creado');
    }
  };

  // Headquarter handlers
  const handleCreateHeadquarter = () => {
    toast.info('Crear sede', {
      description: 'Funcionalidad en desarrollo',
    });
  };

  const handleEditHeadquarter = (headquarter: Headquarter) => {
    toast.info('Editar sede', {
      description: `Editando: ${headquarter.name}`,
    });
  };

  const handleDeleteHeadquarter = (headquarterId: number) => {
    setHeadquarters(prev => prev.filter(h => h.id !== headquarterId));
    toast.success('Sede eliminada');
  };

  const handleSaveHeadquarter = (headquarter: Partial<Headquarter>) => {
    if (headquarter.id) {
      setHeadquarters(prev => prev.map(h => h.id === headquarter.id ? { ...h, ...headquarter } as Headquarter : h));
      toast.success('Sede actualizada');
    } else {
      const newHeadquarter = {
        ...headquarter,
        id: Math.max(...headquarters.map(h => h.id), 0) + 1,
      } as Headquarter;
      setHeadquarters(prev => [...prev, newHeadquarter]);
      toast.success('Sede creada');
    }
  };

  // Utility functions
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return {
    // Projects
    projects,
    setProjects,
    projectSearch,
    setProjectSearch,
    categoryFilter,
    setCategoryFilter,
    priorityFilter,
    setPriorityFilter,
    typeFilter,
    setTypeFilter,
    handleCreateProject,
    handleEditProject,
    handleDeleteProject,
    handleSaveProject,

    // Beneficiaries
    beneficiaries,
    setBeneficiaries,
    beneficiarySearch,
    setBeneficiarySearch,
    locationFilter,
    setLocationFilter,
    categoryBeneficiaryFilter,
    setCategoryBeneficiaryFilter,
    statusFilter,
    setStatusFilter,
    handleCreateBeneficiary,
    handleEditBeneficiary,
    handleDeleteBeneficiary,
    handleSaveBeneficiary,

    // Headquarters
    headquarters,
    setHeadquarters,
    headquarterSearch,
    setHeadquarterSearch,
    headquarterStatusFilter,
    setHeadquarterStatusFilter,
    handleCreateHeadquarter,
    handleEditHeadquarter,
    handleDeleteHeadquarter,
    handleSaveHeadquarter,

    // Utilities
    formatCurrency,
    formatDate,
  };
};
