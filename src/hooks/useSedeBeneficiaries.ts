import { useEffect, useMemo, useState } from "react";
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
import { mapToReport as mapBeneficiaryToReport } from "@/lib";
import {
  createBeneficiarySchema,
  updateBeneficiarySchema,
} from "@/lib/schemas/beneficiary.schema";
import {
  generateBeneficiariesExcel,
  generateBeneficiariesPDF,
} from "@/lib/reportGenerator";
import {
  FIVE_MINUTES_MS,
  getTimedCache,
  setTimedCache,
} from "@/lib/timedCache";

export const applySedeBeneficiaryFilters = (
  beneficiaries: Beneficiary[],
  assignedHeadquarterId: string | null,
  search: string,
  headquarterFilter: string,
  categoryFilter: string,
  statusFilter: string,
) => {
  if (!assignedHeadquarterId) return [];

  return beneficiaries.filter((b) => {
    const matchesAssignedHeadquarter =
      b.headquarters_id === assignedHeadquarterId;
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
      matchesAssignedHeadquarter &&
      matchesSearch &&
      matchesHeadquarter &&
      matchesCategory &&
      matchesStatus
    );
  });
};

export const useSedeBeneficiaries = () => {
  const { user, isLoading: authLoading } = useAuth();

  // Beneficiaries state
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [headquarterFilter, setHeadquarterFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Headquarters for filters
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([]);
  const [headquartersLoading, setHeadquartersLoading] = useState(true);
  const [assignedHeadquarterId, setAssignedHeadquarterId] = useState<
    string | null
  >(null);
  const [assignedHeadquarterName, setAssignedHeadquarterName] = useState<
    string | null
  >(null);
  const [headquarterDirectorNames, setHeadquarterDirectorNames] = useState<
    Record<string, string>
  >({});

  const resolveHeadquarterFromUser = async () => {
    try {
      // Priorizar el dato ya enriquecido en el usuario autenticado.
      if (user?.headquarter_id) {
        const hq = await headquarterService.getById(user.headquarter_id);
        return hq ? [hq] : [];
      }

      const dbUser = await userService.getById(user?.id || "");
      if (dbUser?.headquarter_id) {
        const hq = await headquarterService.getById(dbUser.headquarter_id);
        return hq ? [hq] : [];
      }
    } catch (error) {
      console.warn(
        "No se pudo resolver sede desde user.headquarter_id:",
        error,
      );
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

  const loadAssignedHeadquarter = async (forceRefresh = false) => {
    if (!user?.id) {
      setAssignedHeadquarterId(null);
      setAssignedHeadquarterName(null);
      setHeadquarters([]);
      setHeadquartersLoading(false);
      toast.error("Sesión inválida", {
        description: "No se pudo identificar al usuario autenticado.",
      });
      return;
    }

    const cacheKey = `sede:beneficiaries:assigned-headquarter:${user.id}`;
    if (!forceRefresh) {
      const cached = getTimedCache<{
        assignedHeadquarterId: string;
        assignedHeadquarterName: string;
        headquarters: Headquarter[];
      }>(cacheKey);
      if (cached) {
        setAssignedHeadquarterId(cached.assignedHeadquarterId);
        setAssignedHeadquarterName(cached.assignedHeadquarterName);
        setHeadquarters(cached.headquarters);
        setHeadquarterFilter(cached.assignedHeadquarterId);
        setHeadquartersLoading(false);
        return;
      }
    }

    try {
      setHeadquartersLoading(true);

      // Relacion principal: user.headquarter_id -> headquarters.headquarters_id
      let directorHeadquarters = await resolveHeadquarterFromUser();

      // Fallback: headquarters.user_id -> user.id
      if (directorHeadquarters.length === 0) {
        directorHeadquarters = await headquarterService.getByDirectorId(
          user.id,
        );
      }

      // Fallback: metadata del usuario.
      if (directorHeadquarters.length === 0) {
        directorHeadquarters = await resolveHeadquarterFromMetadata();
      }

      if (directorHeadquarters.length === 0) {
        setAssignedHeadquarterId(null);
        setAssignedHeadquarterName(null);
        setHeadquarters([]);
        toast.error("Sede no asignada", {
          description: "No se encontro una sede asociada a este usuario.",
        });
        return;
      }

      const assigned = directorHeadquarters[0];
      setAssignedHeadquarterId(assigned.headquarters_id);
      setAssignedHeadquarterName(assigned.name);
      setHeadquarters(directorHeadquarters);
      setHeadquarterFilter(assigned.headquarters_id);
      setTimedCache(
        cacheKey,
        {
          assignedHeadquarterId: assigned.headquarters_id,
          assignedHeadquarterName: assigned.name,
          headquarters: directorHeadquarters,
        },
        FIVE_MINUTES_MS,
      );
    } catch (error) {
      toast.error("Error al cargar sede", {
        description: "No se pudo obtener la sede asignada.",
      });
    } finally {
      setHeadquartersLoading(false);
    }
  };

  const loadBeneficiaries = async (
    headquarterId: string | null,
    forceRefresh = false,
  ) => {
    if (!headquarterId) {
      setBeneficiaries([]);
      setLoading(false);
      return;
    }

    const cacheKey = `sede:beneficiaries:list:${headquarterId}`;
    if (!forceRefresh) {
      const cached = getTimedCache<Beneficiary[]>(cacheKey);
      if (cached) {
        setBeneficiaries(cached);
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);

      // Relacion principal: beneficiary.headquarters_id -> headquarters.headquarters_id
      const data = await beneficiaryService.getByHeadquarterId(headquarterId);
      setBeneficiaries(data);
      setTimedCache(cacheKey, data, FIVE_MINUTES_MS);
    } catch (error) {
      toast.error("Error al cargar beneficiarios", {
        description: "No se pudieron cargar los beneficiarios de la sede.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    void loadAssignedHeadquarter();
  }, [authLoading, user?.id]);

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

  useEffect(() => {
    void loadBeneficiaries(assignedHeadquarterId);
  }, [assignedHeadquarterId]);

  const filtered = useMemo(() => {
    return applySedeBeneficiaryFilters(
      beneficiaries,
      assignedHeadquarterId,
      search,
      headquarterFilter,
      categoryFilter,
      statusFilter,
    );
  }, [
    beneficiaries,
    assignedHeadquarterId,
    search,
    headquarterFilter,
    categoryFilter,
    statusFilter,
  ]);

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

  const stats = useMemo(() => {
    const total = beneficiaries.length;
    const active = beneficiaries.filter((b) => b.status === "activo").length;
    return { total, active, newPlayersThisMonth };
  }, [beneficiaries, newPlayersThisMonth]);

  const handleCreate = async (beneficiaryData: CreateBeneficiaryData) => {
    try {
      if (!assignedHeadquarterId) {
        toast.error("Sede no asignada", {
          description: "No se puede crear un beneficiario sin sede asignada.",
        });
        return false;
      }

      const payload: CreateBeneficiaryData = {
        ...beneficiaryData,
        headquarters_id: assignedHeadquarterId,
      };

      const result = createBeneficiarySchema.safeParse(payload);
      if (!result.success) {
        const firstError = result.error.errors[0];
        toast.error("Error de validacion", {
          description: firstError.message,
        });
        return false;
      }

      const newBeneficiary = await beneficiaryService.create(payload);

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
        description: `${payload.first_name} ${payload.last_name} ha sido agregado correctamente`,
      });

      await loadBeneficiaries(assignedHeadquarterId, true);
      setPhotoFile(null);
      return true;
    } catch (error) {
      toast.error("Error al crear", {
        description: "No se pudo crear el beneficiario",
      });
      return false;
    }
  };

  const handleUpdate = async (
    beneficiaryId: string,
    beneficiaryData: UpdateBeneficiaryData,
  ) => {
    try {
      if (!assignedHeadquarterId) {
        toast.error("Sede no asignada", {
          description:
            "No se puede actualizar un beneficiario sin sede asignada.",
        });
        return false;
      }

      const payload: UpdateBeneficiaryData = {
        ...beneficiaryData,
        headquarters_id: assignedHeadquarterId,
      };

      const result = updateBeneficiarySchema.safeParse(payload);
      if (!result.success) {
        const firstError = result.error.errors[0];
        toast.error("Error de validacion", {
          description: firstError.message,
        });
        return false;
      }

      let photoUrl = payload.photo_url;
      if (photoFile) {
        photoUrl = await beneficiaryService.uploadPhoto(
          beneficiaryId,
          photoFile,
        );
      }

      await beneficiaryService.update(beneficiaryId, {
        ...payload,
        photo_url: photoUrl,
      });

      toast.success("Beneficiario actualizado", {
        description: `${payload.first_name || ""} ${payload.last_name || ""} ha sido actualizado correctamente`,
      });

      await loadBeneficiaries(assignedHeadquarterId, true);
      setPhotoFile(null);
      return true;
    } catch (error) {
      toast.error("Error al actualizar", {
        description: "No se pudo actualizar el beneficiario",
      });
      return false;
    }
  };

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
    }
    return await handleCreate(beneficiaryData as CreateBeneficiaryData);
  };

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
      await loadBeneficiaries(assignedHeadquarterId, true);
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

  const currentUserName =
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();
  const generatedByLabel = currentUserName
    ? `Director de sede: ${currentUserName}`
    : "Director de sede";

  const handleExportExcel = (beneficiariesToExport?: Beneficiary[]) => {
    const data = mapBeneficiaryToReport(beneficiariesToExport || filtered, {
      headquarterMap,
      headquarterDirectorMap,
    });
    generateBeneficiariesExcel(data, "beneficiarios", {
      generatedBy: generatedByLabel,
      headquartersName: assignedHeadquarterName || "Sin sede",
    });
    toast.success("Reporte Excel generado", {
      description: `Se exportaron ${data.length} beneficiarios`,
    });
  };

  const handleExportPDF = (beneficiariesToExport?: Beneficiary[]) => {
    const data = mapBeneficiaryToReport(beneficiariesToExport || filtered, {
      headquarterMap,
      headquarterDirectorMap,
    });
    generateBeneficiariesPDF(data, "beneficiarios", {
      generatedBy: generatedByLabel,
      headquartersName: assignedHeadquarterName || "Sin sede",
    });
    toast.success("Reporte PDF generado", {
      description: `Se exportaron ${data.length} beneficiarios`,
    });
  };

  return {
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
    assignedHeadquarterId,
    assignedHeadquarterName,
    setSearch,
    setHeadquarterFilter,
    setCategoryFilter,
    setStatusFilter,
    setPhotoFile,
    loadBeneficiaries,
    handleCreate,
    handleUpdate,
    handleSave,
    handleDelete,
    handleExportExcel,
    handleExportPDF,
  };
};
