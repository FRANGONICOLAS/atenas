import { client } from '../supabase/client';
import type { DonationFromDB, DonationWithProject, DonationStats } from '@/types/donation.types';

export const donationService = {
  // Obtener todas las donaciones de un usuario
  async getUserDonations(userId: string): Promise<DonationWithProject[]> {
    const { data, error } = await client
      .from('donation')
      .select(`
        *,
        project(
          project_id,
          name,
          category,
          finance_goal
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Obtener estadísticas de donaciones de un usuario
  async getUserDonationStats(userId: string): Promise<DonationStats> {
    // Obtener todas las donaciones del usuario
    const donations = await this.getUserDonations(userId);

    // Filtrar solo donaciones aprobadas
    const approvedDonations = donations.filter(d => d.status === 'approved');

    // Calcular total donado
    const totalDonated = approvedDonations.reduce((sum, donation) => {
      return sum + parseFloat(donation.amount);
    }, 0);

    // Obtener proyectos únicos apoyados
    const uniqueProjects = new Map<string, DonationWithProject[]>();
    approvedDonations.forEach(donation => {
      if (donation.project_id) {
        if (!uniqueProjects.has(donation.project_id)) {
          uniqueProjects.set(donation.project_id, []);
        }
        uniqueProjects.get(donation.project_id)!.push(donation);
      }
    });

    const projectsSupported = uniqueProjects.size;

    // Obtener información detallada de proyectos apoyados con progreso
    const supportedProjects = await Promise.all(
      Array.from(uniqueProjects.entries()).map(async ([projectId, projectDonations]) => {
        const totalDonatedToProject = projectDonations.reduce((sum, d) => 
          sum + parseFloat(d.amount), 0
        );

        const project = projectDonations[0].project;
        
        // Obtener total recaudado del proyecto (todas las donaciones)
        const { data: allProjectDonations } = await client
          .from('donation')
          .select('amount')
          .eq('project_id', projectId)
          .eq('status', 'approved');

        const totalProjectRaised = allProjectDonations?.reduce((sum, d) => 
          sum + parseFloat(d.amount), 0
        ) || 0;

        const financeGoal = typeof project?.finance_goal === 'string' 
          ? parseFloat(project.finance_goal) 
          : (project?.finance_goal || 1);
        const progress = Math.min((totalProjectRaised / financeGoal) * 100, 100);

        return {
          project_id: projectId,
          project_name: project?.name || 'Proyecto',
          category: project?.category || 'General',
          totalDonated: totalDonatedToProject,
          progress: Math.round(progress),
          finance_goal: financeGoal
        };
      })
    );

    // Obtener número de beneficiarios impactados
    let beneficiariesImpacted = 0;
    const projectIds = Array.from(uniqueProjects.keys());
    
    if (projectIds.length > 0) {
      const { data: beneficiaries } = await client
        .from('beneficiaries_project')
        .select('beneficiary_id')
        .in('project_id', projectIds);

      // Contar beneficiarios únicos
      const uniqueBeneficiaries = new Set(beneficiaries?.map(b => b.beneficiary_id) || []);
      beneficiariesImpacted = uniqueBeneficiaries.size;
    }

    // Obtener las 3 donaciones más recientes
    const recentDonations = approvedDonations.slice(0, 3);

    return {
      totalDonated,
      projectsSupported,
      beneficiariesImpacted,
      recentDonations,
      supportedProjects: supportedProjects.sort((a, b) => b.totalDonated - a.totalDonated)
    };
  },

  // Obtener donación por ID
  async getDonationById(donationId: string): Promise<DonationFromDB | null> {
    const { data, error } = await client
      .from('donation')
      .select('*')
      .eq('donation_id', donationId)
      .single();

    if (error) throw error;
    return data;
  }
};
