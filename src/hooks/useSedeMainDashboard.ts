import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  beneficiaryService,
  evaluationService,
  headquarterService,
  userService,
} from "@/api/services";
import { getEvaluationScore } from "@/lib/beneficiaryCalculations";
import { useAuth } from "@/hooks/useAuth";
import type { EvaluationRow } from "@/api/types";
import { FIVE_MINUTES_MS, getTimedCache, setTimedCache } from "@/lib/timedCache";

export const BENEFICIARY_CATEGORIES = [
  "Categoría 1",
  "Categoría 2",
  "Categoría 3",
  "Categoría 4",
  "Categoría 5",
] as const;

interface EvaluationWithMeta {
  beneficiary_id: string;
  evaluation: EvaluationRow;
  beneficiaryName: string;
  category: string;
  score: number;
}

interface BeneficiarySlim {
  beneficiary_id: string;
  category: string;
  status?: string;
}

interface SedeDashboardCache {
  assignedHeadquarterId: string;
  assignedHeadquarterName: string;
  beneficiaries: BeneficiarySlim[];
  evaluations: EvaluationWithMeta[];
}

export const useSedeMainDashboard = () => {
  const { user, isLoading: authLoading } = useAuth();

  const [assignedHeadquarterId, setAssignedHeadquarterId] = useState<string | null>(null);
  const [assignedHeadquarterName, setAssignedHeadquarterName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [beneficiaries, setBeneficiaries] = useState<BeneficiarySlim[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationWithMeta[]>([]);
  const [topCategoryFilter, setTopCategoryFilter] = useState("all");

  const resolveHeadquarterFromUser = async () => {
    try {
      if (user?.headquarter_id) {
        const hq = await headquarterService.getById(user.headquarter_id);
        return hq ? [hq] : [];
      }
      const dbUser = await userService.getById(user?.id || "");
      if (dbUser?.headquarter_id) {
        const hq = await headquarterService.getById(dbUser.headquarter_id);
        return hq ? [hq] : [];
      }
    } catch {
      // silently fallback
    }
    return [];
  };

  const resolveHeadquarterFromMetadata = async () => {
    const meta = user?.user_metadata ?? {};
    const metaId =
      (meta["headquarters_id"] as string | undefined) ||
      (meta["headquarter_id"] as string | undefined) ||
      (meta["sede_id"] as string | undefined) ||
      (meta["sedeId"] as string | undefined);
    const metaName =
      (meta["headquarters_name"] as string | undefined) ||
      (meta["headquarter_name"] as string | undefined) ||
      (meta["sede_name"] as string | undefined) ||
      (meta["sede"] as string | undefined);

    if (metaId) {
      const hq = await headquarterService.getById(metaId);
      return hq ? [hq] : [];
    }
    if (metaName) {
      return await headquarterService.searchByName(metaName);
    }
    return [];
  };

  const loadData = async (forceRefresh = false) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const cacheKey = `sede:main-dashboard:${user.id}`;
    if (!forceRefresh) {
      const cached = getTimedCache<SedeDashboardCache>(cacheKey);
      if (cached) {
        setAssignedHeadquarterId(cached.assignedHeadquarterId);
        setAssignedHeadquarterName(cached.assignedHeadquarterName);
        setBeneficiaries(cached.beneficiaries);
        setEvaluations(cached.evaluations);
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);

      // Resolve HQ with fallback chain
      let directorHqs = await resolveHeadquarterFromUser();
      if (directorHqs.length === 0) {
        directorHqs = await headquarterService.getByDirectorId(user.id);
      }
      if (directorHqs.length === 0) {
        directorHqs = await resolveHeadquarterFromMetadata();
      }
      if (directorHqs.length === 0) {
        setLoading(false);
        return;
      }

      const hq = directorHqs[0];
      setAssignedHeadquarterId(hq.headquarters_id);
      setAssignedHeadquarterName(hq.name);

      // Load beneficiaries and evaluations in parallel
      const [benefsData, evalsData] = await Promise.all([
        beneficiaryService.getByHeadquarterId(hq.headquarters_id),
        evaluationService.getByHeadquarterId(hq.headquarters_id),
      ]);

      setBeneficiaries(
        benefsData.map((b) => ({
          beneficiary_id: b.beneficiary_id,
          category: b.category,
          status: b.status,
        })),
      );

      // Build category lookup from loaded beneficiaries
      const categoryMap = new Map(
        benefsData.map((b) => [b.beneficiary_id, b.category]),
      );

      // Map evaluations with beneficiary category
      const mapped: EvaluationWithMeta[] = [];
      for (const row of evalsData) {
        if (!row.evaluation || !row.beneficiary_id) continue;
        const evaluation = row.evaluation as EvaluationRow;
        const score = getEvaluationScore(evaluation);
        const name = `${row.beneficiary?.first_name ?? ""} ${row.beneficiary?.last_name ?? ""}`.trim();
        const category =
          categoryMap.get(row.beneficiary_id) ?? "Sin categoría";
        mapped.push({
          beneficiary_id: row.beneficiary_id,
          evaluation,
          beneficiaryName: name || "Beneficiario",
          category,
          score,
        });
      }
      setEvaluations(mapped);
      setTimedCache(
        cacheKey,
        {
          assignedHeadquarterId: hq.headquarters_id,
          assignedHeadquarterName: hq.name,
          beneficiaries: benefsData.map((b) => ({
            beneficiary_id: b.beneficiary_id,
            category: b.category,
            status: b.status,
          })),
          evaluations: mapped,
        },
        FIVE_MINUTES_MS,
      );
    } catch (error) {
      toast.error("Error al cargar datos", {
        description: "No se pudieron cargar los datos del panel.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    void loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id]);

  // Beneficiaries grouped by category
  const categorySummary = useMemo(() => {
    return BENEFICIARY_CATEGORIES.map((cat) => ({
      categoria: cat,
      jugadores: beneficiaries.filter((b) => b.category === cat).length,
    }));
  }, [beneficiaries]);

  // Top jugadores: best technical_tactic score per beneficiary, filterable by category
  const topJugadores = useMemo(() => {
    const techEvals = evaluations.filter(
      (e) => e.evaluation.type === "TECHNICAL",
    );

    // Keep only the best score per beneficiary
    const bestByBeneficiary = new Map<
      string,
      { score: number; name: string; category: string }
    >();
    for (const ev of techEvals) {
      const existing = bestByBeneficiary.get(ev.beneficiary_id);
      if (!existing || ev.score > existing.score) {
        bestByBeneficiary.set(ev.beneficiary_id, {
          score: ev.score,
          name: ev.beneficiaryName,
          category: ev.category,
        });
      }
    }

    let sorted = Array.from(bestByBeneficiary.values()).sort(
      (a, b) => b.score - a.score,
    );

    if (topCategoryFilter !== "all") {
      sorted = sorted.filter((j) => j.category === topCategoryFilter);
    }

    return sorted.slice(0, 5);
  }, [evaluations, topCategoryFilter]);

  // General sede indicators derived from evaluations
  const indicadores = useMemo(() => {
    const techEvals = evaluations.filter(
      (e) => e.evaluation.type === "TECHNICAL" && e.score > 0,
    );
    const avgDeportivo =
      techEvals.length
        ? Math.round(
            techEvals.reduce((sum, e) => sum + e.score, 0) / techEvals.length,
          )
        : 0;

    const totalBenef = beneficiaries.length;
    const activeBenef = beneficiaries.filter(
      (b) => b.status === "activo",
    ).length;
    const pctActivos =
      totalBenef > 0 ? Math.round((activeBenef / totalBenef) * 100) : 0;

    const uniqueEvaluated = new Set(evaluations.map((e) => e.beneficiary_id))
      .size;
    const pctEvaluados =
      totalBenef > 0 ? Math.round((uniqueEvaluated / totalBenef) * 100) : 0;

    return {
      avgDeportivo,
      pctActivos,
      pctEvaluados,
      totalBenef,
      activeBenef,
      uniqueEvaluated,
      totalEvaluaciones: evaluations.length,
    };
  }, [evaluations, beneficiaries]);

  // Available categories from actual beneficiary data
  const availableCategories = useMemo(() => {
    const cats = new Set(beneficiaries.map((b) => b.category));
    return BENEFICIARY_CATEGORIES.filter((c) => cats.has(c));
  }, [beneficiaries]);

  return {
    loading,
    assignedHeadquarterId,
    assignedHeadquarterName,
    categorySummary,
    topJugadores,
    topCategoryFilter,
    setTopCategoryFilter,
    indicadores,
    availableCategories,
  };
};
