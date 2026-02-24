import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { beneficiaryService, headquarterService } from "@/api/services";
import type { Headquarter } from "@/types";
import type {
  Beneficiary,
  CreateBeneficiaryData,
  UpdateBeneficiaryData,
} from "@/types/beneficiary.types";
import {
  mapToReport as mapBeneficiaryToReport,
} from "@/lib/beneficiaryUtils";
import {
  createBeneficiarySchema,
  updateBeneficiarySchema,
} from "@/lib/schemas/beneficiary.schema";
import {
  generateBeneficiariesExcel,
  generateBeneficiariesPDF,
} from "@/lib/reportGenerator";

export const useBeneficiaries = () => {
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

  // Cargar beneficiarios desde Supabase
  const loadBeneficiaries = async () => {
    try {
      setLoading(true);
      const data = await beneficiaryService.getAll();
      setBeneficiaries(data);
    } catch (error) {
      console.error("Error loading beneficiaries:", error);
      toast.error("Error al cargar beneficiarios");
    } finally {
      setLoading(false);
    }
  };

  // Cargar sedes para filtros
  const loadHeadquarters = async () => {
    try {
      setHeadquartersLoading(true);
      const data = await headquarterService.getAll();
      setHeadquarters(data);
    } catch (error) {
      console.error("Error loading headquarters:", error);
      toast.error("Error al cargar sedes");
    } finally {
      setHeadquartersLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadBeneficiaries();
    loadHeadquarters();
  }, []);

  // Filtrado de beneficiarios
  const filtered = useMemo(() => {
    return beneficiaries.filter((b) => {
      const matchesSearch =
        b.first_name.toLowerCase().includes(search.toLowerCase()) ||
        b.last_name.toLowerCase().includes(search.toLowerCase()) ||
        (b.guardian &&
          b.guardian.toLowerCase().includes(search.toLowerCase()));
      const matchesHeadquarter =
        headquarterFilter === "all" || b.headquarters_id === headquarterFilter;
      const matchesCategory =
        categoryFilter === "all" || b.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;
      return (
        matchesSearch && matchesHeadquarter && matchesCategory && matchesStatus
      );
    });
  }, [
    beneficiaries,
    search,
    headquarterFilter,
    categoryFilter,
    statusFilter,
  ]);

  // Estadísticas generales
  const stats = useMemo(() => {
    const total = beneficiaries.length;
    const active = beneficiaries.filter((b) => b.status === "activo").length;
    const avgPerformance = beneficiaries.length
      ? Math.round(
          beneficiaries.reduce((sum, b) => sum + (b.performance || 0), 0) /
            beneficiaries.length
        )
      : 0;
    return { total, active, avgPerformance };
  }, [beneficiaries]);

  // Estadísticas por sede
  const statsByHeadquarter = useMemo(() => {
    return headquarters.map((hq) => {
      const list = beneficiaries.filter(
        (b) => b.headquarters_id === hq.headquarters_id
      );
      const active = list.filter((b) => b.status === "activo").length;
      const avgPerf = list.length
        ? Math.round(
            list.reduce((sum, b) => sum + (b.performance || 0), 0) /
              list.length
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
          photoFile
        );
        await beneficiaryService.update(newBeneficiary.beneficiary_id, {
          photo_url: photoUrl,
        });
      }

      toast.success("Beneficiario creado", {
        description: `${beneficiaryData.first_name} ${beneficiaryData.last_name} ha sido agregado correctamente`,
      });
      
      await loadBeneficiaries();
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

  // Handler para actualizar beneficiario
  const handleUpdate = async (
    beneficiaryId: string,
    beneficiaryData: UpdateBeneficiaryData
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
        photoUrl = await beneficiaryService.uploadPhoto(beneficiaryId, photoFile);
      }

      // Actualizar beneficiario
      await beneficiaryService.update(beneficiaryId, {
        ...beneficiaryData,
        photo_url: photoUrl,
      });

      toast.success("Beneficiario actualizado", {
        description: `${beneficiaryData.first_name || ""} ${beneficiaryData.last_name || ""} ha sido actualizado correctamente`,
      });
      
      await loadBeneficiaries();
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

  // Handler para guardar (crear o actualizar)
  const handleSave = async (
    beneficiaryData: CreateBeneficiaryData | UpdateBeneficiaryData,
    isEditing: boolean,
    editId?: string
  ) => {
    if (isEditing && editId) {
      return await handleUpdate(editId, beneficiaryData as UpdateBeneficiaryData);
    } else {
      return await handleCreate(beneficiaryData as CreateBeneficiaryData);
    }
  };

  // Handler para eliminar beneficiario
  const handleDelete = async (
    beneficiaryId: string,
    beneficiaryName: string
  ) => {
    try {
      await beneficiaryService.delete(beneficiaryId);
      await loadBeneficiaries();
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

  // Handler para exportar a Excel
  const handleExportExcel = (beneficiariesToExport?: Beneficiary[]) => {
    const data = mapBeneficiaryToReport(beneficiariesToExport || filtered);
    generateBeneficiariesExcel(data, "beneficiarios");
    toast.success("Reporte Excel generado", {
      description: `Se exportaron ${data.length} beneficiarios`,
    });
  };

  // Handler para exportar a PDF
  const handleExportPDF = (beneficiariesToExport?: Beneficiary[]) => {
    const data = mapBeneficiaryToReport(beneficiariesToExport || filtered);
    generateBeneficiariesPDF(data, "beneficiarios");
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
