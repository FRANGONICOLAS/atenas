import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { beneficiaryService, headquarterService, userService } from "@/api/services";
import { useAuth } from "@/hooks/useAuth";
import type { Headquarter } from "@/types";
import type {
  Beneficiary,
  CreateBeneficiaryData,
  UpdateBeneficiaryData,
} from "@/types/beneficiary.types";
import { mapToReport as mapBeneficiaryToReport } from "@/lib/beneficiaryUtils";
import {
  createBeneficiarySchema,
  updateBeneficiarySchema,
} from "@/lib/schemas/beneficiary.schema";
import {
  generateBeneficiariesExcel,
  generateBeneficiariesPDF,
} from "@/lib/reportGenerator";

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
    const matchesAssignedHeadquarter = b.headquarters_id === assignedHeadquarterId;
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
  const [assignedHeadquarterId, setAssignedHeadquarterId] = useState<string | null>(null);
  const [assignedHeadquarterName, setAssignedHeadquarterName] = useState<string | null>(null);

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
      console.warn("No se pudo resolver sede desde user.headquarter_id:", error);
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

  const loadAssignedHeadquarter = async () => {
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

    try {
      setHeadquartersLoading(true);

      // Relacion principal: user.headquarter_id -> headquarters.headquarters_id
      let directorHeadquarters = await resolveHeadquarterFromUser();

      // Fallback: headquarters.user_id -> user.id
      if (directorHeadquarters.length === 0) {
        directorHeadquarters = await headquarterService.getByDirectorId(user.id);
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
    } catch (error) {
      console.error("Error loading assigned headquarter:", error);
      toast.error("Error al cargar sede", {
        description: "No se pudo obtener la sede asignada.",
      });
    } finally {
      setHeadquartersLoading(false);
    }
  };

  const loadBeneficiaries = async (headquarterId: string | null) => {
    if (!headquarterId) {
      setBeneficiaries([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Relacion principal: beneficiary.headquarters_id -> headquarters.headquarters_id
      const data = await beneficiaryService.getByHeadquarterId(headquarterId);
      setBeneficiaries(data);
    } catch (error) {
      console.error("Error loading beneficiaries:", error);
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

  const stats = useMemo(() => {
    const total = beneficiaries.length;
    const active = beneficiaries.filter((b) => b.status === "activo").length;
    const avgPerformance = beneficiaries.length
      ? Math.round(
          beneficiaries.reduce((sum, b) => sum + (b.performance || 0), 0) /
            beneficiaries.length,
        )
      : 0;
    const avgAttendance = beneficiaries.length
      ? Math.round(
          beneficiaries.reduce((sum, b) => sum + (b.attendance || 0), 0) /
            beneficiaries.length,
        )
      : 0;
    return { total, active, avgPerformance, avgAttendance };
  }, [beneficiaries]);

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

      await loadBeneficiaries(assignedHeadquarterId);
      setPhotoFile(null);
      return true;
    } catch (error) {
      console.error("Error creating beneficiary:", error);
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
          description: "No se puede actualizar un beneficiario sin sede asignada.",
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
        photoUrl = await beneficiaryService.uploadPhoto(beneficiaryId, photoFile);
      }

      await beneficiaryService.update(beneficiaryId, {
        ...payload,
        photo_url: photoUrl,
      });

      toast.success("Beneficiario actualizado", {
        description: `${payload.first_name || ""} ${payload.last_name || ""} ha sido actualizado correctamente`,
      });

      await loadBeneficiaries(assignedHeadquarterId);
      setPhotoFile(null);
      return true;
    } catch (error) {
      console.error("Error updating beneficiary:", error);
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
      return await handleUpdate(editId, beneficiaryData as UpdateBeneficiaryData);
    }
    return await handleCreate(beneficiaryData as CreateBeneficiaryData);
  };

  const handleDelete = async (beneficiaryId: string, beneficiaryName: string) => {
    try {
      await beneficiaryService.delete(beneficiaryId);
      await loadBeneficiaries(assignedHeadquarterId);
      toast.success("Beneficiario eliminado", {
        description: `${beneficiaryName} ha sido eliminado`,
      });
    } catch (error) {
      console.error("Error deleting beneficiary:", error);
      toast.error("Error al eliminar", {
        description: "No se pudo eliminar el beneficiario",
      });
      throw error;
    }
  };

  const handleExportExcel = (beneficiariesToExport?: Beneficiary[]) => {
    const data = mapBeneficiaryToReport(beneficiariesToExport || filtered);
    generateBeneficiariesExcel(data, "beneficiarios");
    toast.success("Reporte Excel generado", {
      description: `Se exportaron ${data.length} beneficiarios`,
    });
  };

  const handleExportPDF = (beneficiariesToExport?: Beneficiary[]) => {
    const data = mapBeneficiaryToReport(beneficiariesToExport || filtered);
    generateBeneficiariesPDF(data, "beneficiarios");
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
