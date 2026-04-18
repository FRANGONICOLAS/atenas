import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  beneficiaryService,
  headquarterService,
  userService,
} from "@/api/services";
import { useAuth } from "@/hooks/useAuth";
import type { Headquarter } from "@/types";
import type {
  Beneficiary,
  CreateBeneficiaryData,
  UpdateBeneficiaryData,
} from "@/types/beneficiary.types";
import {
  FIVE_MINUTES_MS,
  getTimedCache,
  setTimedCache,
} from "@/lib/timedCache";
import { mapToReport as mapBeneficiaryToReport } from "@/lib";
import {
  createBeneficiarySchema,
  updateBeneficiarySchema,
} from "@/lib/schemas/beneficiary.schema";
import {
  generateBeneficiariesExcel,
  generateBeneficiariesPDF,
} from "@/lib/reportGenerator";

const BENEFICIARIES_CACHE_KEY = "beneficiaries:all";
const HEADQUARTERS_CACHE_KEY = "headquarters:all";

export const useBeneficiaries = () => {
  const cachedBeneficiaries = getTimedCache<Beneficiary[]>(
    BENEFICIARIES_CACHE_KEY,
  );
  const cachedHeadquarters = getTimedCache<Headquarter[]>(
    HEADQUARTERS_CACHE_KEY,
  );

  // Beneficiaries state
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(
    cachedBeneficiaries ?? [],
  );
  const [loading, setLoading] = useState(!cachedBeneficiaries);
  const [search, setSearch] = useState("");
  const [headquarterFilter, setHeadquarterFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Headquarters for filters
  const [headquarters, setHeadquarters] = useState<Headquarter[]>(
    cachedHeadquarters ?? [],
  );
  const [headquartersLoading, setHeadquartersLoading] =
    useState(!cachedHeadquarters);
  const [headquarterDirectorNames, setHeadquarterDirectorNames] = useState<
    Record<string, string>
  >({});

  // Cargar beneficiarios desde Supabase
  const loadBeneficiaries = async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cached = getTimedCache<Beneficiary[]>(BENEFICIARIES_CACHE_KEY);
        if (cached) {
          setBeneficiaries(cached);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      const data = await beneficiaryService.getAll();
      setBeneficiaries(data);
      setTimedCache(BENEFICIARIES_CACHE_KEY, data, FIVE_MINUTES_MS);
    } catch (error) {
      toast.error("Error al cargar beneficiarios");
    } finally {
      setLoading(false);
    }
  };

  // Cargar sedes para filtros
  const loadHeadquarters = async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cached = getTimedCache<Headquarter[]>(HEADQUARTERS_CACHE_KEY);
        if (cached) {
          setHeadquarters(cached);
          setHeadquartersLoading(false);
          return;
        }
      }

      setHeadquartersLoading(true);
      const data = await headquarterService.getAll();
      setHeadquarters(data);
      setTimedCache(HEADQUARTERS_CACHE_KEY, data, FIVE_MINUTES_MS);
    } catch (error) {
      toast.error("Error al cargar sedes");
    } finally {
      setHeadquartersLoading(false);
    }
  };

  useEffect(() => {
    let canceled = false;
    const loadDirectorNames = async () => {
      const userIds = Array.from(
        new Set(
          headquarters.map((hq) => hq.user_id).filter(Boolean) as string[],
        ),
      );

      if (userIds.length === 0) {
        setHeadquarterDirectorNames({});
        return;
      }

      const results = await Promise.all(
        userIds.map(async (userId) => {
          try {
            const user = await userService.getById(userId);
            return [
              userId,
              user ? `${user.first_name} ${user.last_name}` : "Desconocido",
            ] as const;
          } catch (error) {
            return [userId, "Desconocido"] as const;
          }
        }),
      );

      if (!canceled) {
        setHeadquarterDirectorNames(Object.fromEntries(results));
      }
    };

    void loadDirectorNames();
    return () => {
      canceled = true;
    };
  }, [headquarters]);

  // Cargar datos iniciales
  useEffect(() => {
    void loadBeneficiaries();
    void loadHeadquarters();
  }, []);

  // Filtrado de beneficiarios
  const filtered = useMemo(() => {
    return beneficiaries.filter((b) => {
      const matchesSearch =
        b.first_name.toLowerCase().includes(search.toLowerCase()) ||
        b.last_name.toLowerCase().includes(search.toLowerCase()) ||
        (b.guardian && b.guardian.toLowerCase().includes(search.toLowerCase()));
      const matchesHeadquarter =
        headquarterFilter === "all" || b.headquarters_id === headquarterFilter;
      const matchesCategory =
        categoryFilter === "all" || b.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;
      return (
        matchesSearch && matchesHeadquarter && matchesCategory && matchesStatus
      );
    });
  }, [beneficiaries, search, headquarterFilter, categoryFilter, statusFilter]);

  // Estadísticas generales
  const stats = useMemo(() => {
    const total = beneficiaries.length;
    const active = beneficiaries.filter((b) => b.status === "activo").length;
    const avgPerformance = beneficiaries.length
      ? Math.round(
          beneficiaries.reduce((sum, b) => sum + (b.performance || 0), 0) /
            beneficiaries.length,
        )
      : 0;
    return { total, active, avgPerformance };
  }, [beneficiaries]);

  const newPlayersThisMonth = useMemo(() => {
    const today = new Date();
    const monthStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    ).getTime();

    return beneficiaries.filter((b) => {
      const createdAt = b.created_at || b.registry_date;
      if (!createdAt) return false;
      const date = new Date(createdAt).getTime();
      return !Number.isNaN(date) && date >= monthStart;
    }).length;
  }, [beneficiaries]);

  // Estadísticas por sede
  const statsByHeadquarter = useMemo(() => {
    return headquarters.map((hq) => {
      const list = beneficiaries.filter(
        (b) => b.headquarters_id === hq.headquarters_id,
      );
      const active = list.filter((b) => b.status === "activo").length;
      const avgPerf = list.length
        ? Math.round(
            list.reduce((sum, b) => sum + (b.performance || 0), 0) /
              list.length,
          )
        : 0;
      return { name: hq.name, total: list.length, active, avgPerf };
    });
  }, [beneficiaries, headquarters]);

  // Handler para crear beneficiario
  const handleCreate = async (beneficiaryData: CreateBeneficiaryData) => {
    try {
      // Validar
      const result = createBeneficiarySchema.safeParse(beneficiaryData);
      if (!result.success) {
        const firstError = result.error.errors[0];
        toast.error("Error de validación", {
          description: firstError.message,
        });
        return false;
      }

      // Crear beneficiario
      const newBeneficiary = await beneficiaryService.create(beneficiaryData);

      // Si hay foto, subirla
      if (photoFile) {
        const photoUrl = await beneficiaryService.uploadPhoto(
          newBeneficiary.beneficiary_id,
          photoFile,
        );
        await beneficiaryService.update(newBeneficiary.beneficiary_id, {
          photo_url: photoUrl,
        });
      }

      toast.success("Beneficiario creado", {
        description: `${beneficiaryData.first_name} ${beneficiaryData.last_name} ha sido agregado correctamente`,
      });

      await loadBeneficiaries(true);
      setPhotoFile(null);
      return true;
    } catch (error) {
      toast.error("Error al crear", {
        description: "No se pudo crear el beneficiario",
      });
      return false;
    }
  };

  // Handler para actualizar beneficiario
  const handleUpdate = async (
    beneficiaryId: string,
    beneficiaryData: UpdateBeneficiaryData,
  ) => {
    try {
      // Validar
      const result = updateBeneficiarySchema.safeParse(beneficiaryData);
      if (!result.success) {
        const firstError = result.error.errors[0];
        toast.error("Error de validación", {
          description: firstError.message,
        });
        return false;
      }

      // Si hay nueva foto, subirla
      let photoUrl = beneficiaryData.photo_url;
      if (photoFile) {
        photoUrl = await beneficiaryService.uploadPhoto(
          beneficiaryId,
          photoFile,
        );
      }

      // Actualizar beneficiario
      await beneficiaryService.update(beneficiaryId, {
        ...beneficiaryData,
        photo_url: photoUrl,
      });

      toast.success("Beneficiario actualizado", {
        description: `${beneficiaryData.first_name || ""} ${beneficiaryData.last_name || ""} ha sido actualizado correctamente`,
      });

      await loadBeneficiaries(true);
      setPhotoFile(null);
      return true;
    } catch (error) {
      toast.error("Error al actualizar", {
        description: "No se pudo actualizar el beneficiario",
      });
      return false;
    }
  };

  // Handler para guardar (crear o actualizar)
  const handleSave = async (
    beneficiaryData: CreateBeneficiaryData | UpdateBeneficiaryData,
    isEditing: boolean,
    editId?: string,
  ) => {
    if (isEditing && editId) {
      return await handleUpdate(
        editId,
        beneficiaryData as UpdateBeneficiaryData,
      );
    } else {
      return await handleCreate(beneficiaryData as CreateBeneficiaryData);
    }
  };

  // Handler para eliminar beneficiario
  const handleDelete = async (
    beneficiaryId: string,
    beneficiaryName: string,
  ) => {
    try {
      // Verificar si el beneficiario tiene evaluaciones
      const evaluationCount =
        await beneficiaryService.countEvaluations(beneficiaryId);

      if (evaluationCount > 0) {
        toast.error("No se puede eliminar", {
          description:
            "No puedes eliminar un beneficiario que tiene evaluaciones registradas",
        });
        return;
      }

      await beneficiaryService.delete(beneficiaryId);
      await loadBeneficiaries(true);
      toast.success("Beneficiario eliminado", {
        description: `${beneficiaryName} ha sido eliminado`,
      });
    } catch (error) {
      toast.error("Error al eliminar", {
        description: "No se pudo eliminar el beneficiario",
      });
      throw error;
    }
  };

  const headquarterMap = useMemo(
    () =>
      headquarters.reduce<Record<string, string>>((acc, hq) => {
        acc[hq.headquarters_id] = hq.name;
        return acc;
      }, {}),
    [headquarters],
  );

  const headquarterDirectorMap = useMemo(
    () =>
      headquarters.reduce<Record<string, string>>((acc, hq) => {
        acc[hq.headquarters_id] =
          headquarterDirectorNames[hq.user_id] || "Desconocido";
        return acc;
      }, {}),
    [headquarters, headquarterDirectorNames],
  );

  const { user } = useAuth();
  const currentUserName =
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();
  const generatedByLabel = currentUserName
    ? `Director: ${currentUserName}`
    : "Director";

  // Handler para exportar a Excel
  const handleExportExcel = (beneficiariesToExport?: Beneficiary[]) => {
    const data = mapBeneficiaryToReport(beneficiariesToExport || filtered, {
      headquarterMap,
      headquarterDirectorMap,
    });
    generateBeneficiariesExcel(data, "beneficiarios", {
      generatedBy: generatedByLabel,
    });
    toast.success("Reporte Excel generado", {
      description: `Se exportaron ${data.length} beneficiarios`,
    });
  };

  // Handler para exportar a PDF
  const handleExportPDF = (beneficiariesToExport?: Beneficiary[]) => {
    const data = mapBeneficiaryToReport(beneficiariesToExport || filtered, {
      headquarterMap,
      headquarterDirectorMap,
    });
    generateBeneficiariesPDF(data, "beneficiarios", {
      generatedBy: generatedByLabel,
    });
    toast.success("Reporte PDF generado", {
      description: `Se exportaron ${data.length} beneficiarios`,
    });
  };

  return {
    // State
    beneficiaries,
    loading,
    search,
    headquarterFilter,
    categoryFilter,
    statusFilter,
    headquarters,
    headquartersLoading,
    filtered,
    stats,
    newPlayersThisMonth,
    statsByHeadquarter,

    // Setters
    setSearch,
    setHeadquarterFilter,
    setCategoryFilter,
    setStatusFilter,
    setPhotoFile,

    // Actions
    loadBeneficiaries,
    handleCreate,
    handleUpdate,
    handleSave,
    handleDelete,
    handleExportExcel,
    handleExportPDF,
  };
};
