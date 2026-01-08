import { useState } from 'react';
import { toast } from 'sonner';
import type {
  Donation,
  DonationStatus,
  DonationType,
  DonationStats,
  PaymentMethod,
  Project,
  ProjectStatus
} from '@/types';

export const useDonatorView = () => {
  const donorName = 'Juan Pérez'; // This would come from user context/auth

  // Donations state
  const [donations, setDonations] = useState<Donation[]>([]);
  const [donationSearch, setDonationSearch] = useState('');
  const [donationStatusFilter, setDonationStatusFilter] = useState('all');
  const [donationTypeFilter, setDonationTypeFilter] = useState('all');
  const [donationDateRange, setDonationDateRange] = useState<{ from?: Date; to?: Date }>({});

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectSearch, setProjectSearch] = useState('');
  const [projectCategoryFilter, setProjectCategoryFilter] = useState('all');
  const [projectStatusFilter, setProjectStatusFilter] = useState('all');

  // Stats state
  const [stats, setStats] = useState<DonationStats>({
    totalDonated: 0,
    projectsSupported: 0,
    beneficiariesImpacted: 0,
    lastDonation: '',
  });

  // Donation handlers
  const handleCreateDonation = () => {
    toast.info('Nueva donación', {
      description: 'Redirigiendo a formulario de donación',
    });
  };

  const handleViewDonation = (donation: Donation) => {
    toast.info('Ver donación', {
      description: `Donación #${donation.id} - ${donation.receiptNumber || 'Sin recibo'}`,
    });
  };

  const handleCancelDonation = (donationId: number) => {
    setDonations(prev => prev.map(d => 
      d.id === donationId ? { ...d, status: 'cancelled' as DonationStatus } : d
    ));
    toast.success('Donación cancelada');
  };

  const handleDownloadReceipt = (donationId: number) => {
    const donation = donations.find(d => d.id === donationId);
    if (donation?.receiptNumber) {
      toast.success('Descargando recibo', {
        description: `Recibo #${donation.receiptNumber}`,
      });
    } else {
      toast.error('Recibo no disponible');
    }
  };

  const handleSaveDonation = (donation: Partial<Donation>) => {
    if (donation.id) {
      setDonations(prev => prev.map(d => d.id === donation.id ? { ...d, ...donation } as Donation : d));
      toast.success('Donación actualizada');
    } else {
      const newDonation = {
        ...donation,
        id: Math.max(...donations.map(d => d.id), 0) + 1,
        donorName,
        receiptNumber: `REC-${Date.now()}`,
      } as Donation;
      setDonations(prev => [...prev, newDonation]);
      toast.success('Donación registrada exitosamente');
    }
  };

  // Project handlers
  const handleViewProject = (project: Project) => {
    toast.info('Ver proyecto', {
      description: `${project.name} - ${project.location}`,
    });
  };

  const handleDonateToProject = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    toast.info('Donar a proyecto', {
      description: `Donando a: ${project?.name}`,
    });
  };

  const handleShareProject = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    toast.success('Enlace copiado', {
      description: `Proyecto: ${project?.name}`,
    });
  };

  // Stats calculation
  const calculateStats = () => {
    const totalDonated = donations
      .filter(d => d.status === 'completed')
      .reduce((sum, d) => sum + d.amount, 0);

    const projectsSupported = new Set(
      donations
        .filter(d => d.status === 'completed' && d.project)
        .map(d => d.project)
    ).size;

    const beneficiariesImpacted = projects
      .filter(p => donations.some(d => d.project === p.name && d.status === 'completed'))
      .reduce((sum, p) => sum + p.beneficiaries, 0);

    const sortedDonations = [...donations]
      .filter(d => d.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const lastDonation = sortedDonations[0]?.date || '';

    setStats({
      totalDonated,
      projectsSupported,
      beneficiariesImpacted,
      lastDonation,
    });
  };

  // Export handlers
  const handleExportDonations = (format: 'excel' | 'pdf') => {
    toast.success('Exportando historial', {
      description: `Descargando historial en formato ${format.toUpperCase()}`,
    });
  };

  // Utility functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDonationStatusLabel = (status: DonationStatus) => {
    const labels = {
      completed: 'Completada',
      pending: 'Pendiente',
      processing: 'Procesando',
      cancelled: 'Cancelada',
    };
    return labels[status];
  };

  const getDonationTypeLabel = (type: DonationType) => {
    const labels = {
      monetary: 'Monetaria',
      equipment: 'Equipamiento',
      infrastructure: 'Infraestructura',
      sponsorship: 'Patrocinio',
    };
    return labels[type];
  };

  const getProjectProgress = (project: Project) => {
    return Math.min((project.currentAmount / project.targetAmount) * 100, 100);
  };

  return {
    // Donor info
    donorName,

    // Donations
    donations,
    setDonations,
    donationSearch,
    setDonationSearch,
    donationStatusFilter,
    setDonationStatusFilter,
    donationTypeFilter,
    setDonationTypeFilter,
    donationDateRange,
    setDonationDateRange,
    handleCreateDonation,
    handleViewDonation,
    handleCancelDonation,
    handleDownloadReceipt,
    handleSaveDonation,

    // Projects
    projects,
    setProjects,
    projectSearch,
    setProjectSearch,
    projectCategoryFilter,
    setProjectCategoryFilter,
    projectStatusFilter,
    setProjectStatusFilter,
    handleViewProject,
    handleDonateToProject,
    handleShareProject,

    // Stats
    stats,
    calculateStats,

    // Export
    handleExportDonations,

    // Utilities
    formatCurrency,
    formatDate,
    getDonationStatusLabel,
    getDonationTypeLabel,
    getProjectProgress,
  };
};
