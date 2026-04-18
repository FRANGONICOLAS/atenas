import { client } from "@/api/supabase/client";
import type {
  DonationFromDB,
  DonationWithProject,
  DonationStats,
} from "@/types/donation.types";

export const donationService = {
  // Obtener todas las donaciones de un usuario
  async getUserDonations(userId: string): Promise<DonationWithProject[]> {
    const { data, error } = await client
      .from("donation")
      .select(
        `
        *,
        project(
          project_id,
          name,
          category,
          finance_goal
        )
      `,
      )
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Obtener estadísticas de donaciones de un usuario
  async getUserDonationStats(userId: string): Promise<DonationStats> {
    // Obtener todas las donaciones del usuario
    const donations = await this.getUserDonations(userId);

    // Filtrar solo donaciones aprobadas
    const approvedDonations = donations.filter((d) => d.status === "approved");

    // Calcular total donado
    const totalDonated = approvedDonations.reduce((sum, donation) => {
      return sum + parseFloat(donation.amount);
    }, 0);

    // Obtener proyectos únicos apoyados
    const uniqueProjects = new Map<string, DonationWithProject[]>();
    approvedDonations.forEach((donation) => {
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
      Array.from(uniqueProjects.entries()).map(
        async ([projectId, projectDonations]: [
          string,
          DonationWithProject[],
        ]) => {
          const totalDonatedToProject = projectDonations.reduce(
            (sum, d) => sum + parseFloat(d.amount ?? "0"),
            0,
          );

          const project = projectDonations[0].project;

          // Obtener total recaudado del proyecto (todas las donaciones)
          const allProjectDonationsQuery = await client
            .from("donation")
            .select("amount")
            .eq("project_id", projectId)
            .eq("status", "approved");
          const allProjectDonations = allProjectDonationsQuery.data as Array<{
            amount?: string;
          }> | null;

          const totalProjectRaised =
            allProjectDonations?.reduce(
              (sum, d) => sum + parseFloat(d.amount ?? "0"),
              0,
            ) || 0;

          const financeGoal =
            typeof project?.finance_goal === "string"
              ? parseFloat(project.finance_goal)
              : project?.finance_goal || 1;
          const progress = Math.min(
            (totalProjectRaised / financeGoal) * 100,
            100,
          );

          return {
            project_id: projectId,
            project_name: project?.name || "Proyecto",
            category: project?.category || "General",
            totalDonated: totalDonatedToProject,
            progress: Math.round(progress),
            finance_goal: financeGoal,
          };
        },
      ),
    );

    // Obtener número de beneficiarios impactados
    let beneficiariesImpacted = 0;
    const projectIds = Array.from(uniqueProjects.keys());

    if (projectIds.length > 0) {
      // Beneficiaries belong to headquarters; get HQ linked to these projects first
      const hqProjectsQuery = await client
        .from("headquarters_project")
        .select("headquarters_id")
        .in("project_id", projectIds);
      const hqProjects = hqProjectsQuery.data as Array<{
        headquarters_id: string;
      }> | null;

      const hqIds = [
        ...new Set(hqProjects?.map((h) => h.headquarters_id) || []),
      ];

      if (hqIds.length > 0) {
        const beneficiariesQuery = await client
          .from("beneficiary")
          .select("beneficiary_id")
          .in("headquarters_id", hqIds);
        const beneficiaries = beneficiariesQuery.data as Array<{
          beneficiary_id: string;
        }> | null;

        const uniqueBeneficiaries = new Set(
          beneficiaries?.map((b) => b.beneficiary_id) || [],
        );
        beneficiariesImpacted = uniqueBeneficiaries.size;
      }
    }

    // Obtener las 3 donaciones más recientes
    const recentDonations = approvedDonations.slice(0, 3);

    return {
      totalDonated,
      projectsSupported,
      beneficiariesImpacted,
      recentDonations,
      supportedProjects: supportedProjects.sort(
        (a, b) => b.totalDonated - a.totalDonated,
      ),
    };
  },

  async getAdminDonationStats(): Promise<{
    totalDonatedThisMonth: number;
    donationsProcessedThisMonth: number;
    recentDonations: Array<{
      id: number;
      donor: string;
      project: string;
      amount: number;
      date: string;
      currency: string;
    }>;
  }> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const startOfNextMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      1,
    )
      .toISOString()
      .split("T")[0];

    const monthQuery = await client
      .from("donation")
      .select("amount")
      .eq("status", "approved")
      .gte("date", startOfMonth)
      .lt("date", startOfNextMonth);

    if (monthQuery.error) throw monthQuery.error;

    const monthData = monthQuery.data as Array<{ amount?: string }> | null;
    const totalDonatedThisMonth =
      monthData?.reduce(
        (sum, donation) => sum + parseFloat(donation.amount ?? "0"),
        0,
      ) || 0;
    const donationsProcessedThisMonth = monthData?.length || 0;

    const recentQuery = await client
      .from("donation")
      .select(
        `donation_id, amount, currency, date, status, user:user_id(first_name,last_name), project:project_id(name)`,
      )
      .eq("status", "approved")
      .order("date", { ascending: false })
      .limit(3);

    if (recentQuery.error) throw recentQuery.error;

    const recentData = recentQuery.data as Array<{
      donation_id: string;
      amount?: string;
      currency: string;
      date: string;
      status: string;
      user?: { first_name: string | null; last_name: string | null };
      project?: { name: string | null };
    }> | null;

    const formattedDonations = (recentData || []).map((donation) => ({
      id: Number(donation.donation_id) || 0,
      donor:
        `${donation.user?.first_name ?? ""} ${donation.user?.last_name ?? ""}`.trim() ||
        "Donante",
      project: donation.project?.name || "Proyecto",
      amount: parseFloat(donation.amount ?? "0"),
      date: donation.date,
      currency: donation.currency || "COP",
    }));

    return {
      totalDonatedThisMonth,
      donationsProcessedThisMonth,
      recentDonations: formattedDonations,
    };
  },

  // Obtener donación por ID
  async getDonationById(donationId: string): Promise<DonationFromDB | null> {
    const { data, error } = await client
      .from("donation")
      .select("*")
      .eq("donation_id", donationId)
      .single();

    if (error) throw error;
    return data;
  },
};
