import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { beneficiaryService, headquarterService } from "@/api/services";
import type { Project, Headquarter } from "@/types";
import type {
  Beneficiary,
  CreateBeneficiaryData,
  UpdateBeneficiaryData,
} from "@/types/beneficiary.types";
import {
  calculateAge,
  getStatusBadge,
  getPerformanceColor,
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
      description:
        "Organización de torneo interbarrial para todas las categorías",
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
  const [projectSearch, setProjectSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Beneficiaries state
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [beneficiariesLoading, setBeneficiariesLoading] = useState(true);
  const [beneficiarySearch, setBeneficiarySearch] = useState("");
  const [headquarterFilter, setHeadquarterFilter] = useState("all");
  const [categoryBeneficiaryFilter, setCategoryBeneficiaryFilter] =
    useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Headquarters state
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([]);
  const [headquartersLoading, setHeadquartersLoading] = useState(true);
  const [headquarterSearch, setHeadquarterSearch] = useState("");
  const [headquarterStatusFilter, setHeadquarterStatusFilter] = useState("all");

  // Cargar beneficiarios desde Supabase
  const loadBeneficiaries = async () => {
    try {
      setBeneficiariesLoading(true);
      const data = await beneficiaryService.getAll();
      setBeneficiaries(data);
    } catch (error) {
      console.error("Error loading beneficiaries:", error);
      toast.error("Error al cargar beneficiarios");
    } finally {
      setBeneficiariesLoading(false);
    }
  };

  // Cargar sedes desde Supabase
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
  const filteredBeneficiaries = useMemo(() => {
    return beneficiaries.filter((b) => {
      const matchesSearch =
        b.first_name.toLowerCase().includes(beneficiarySearch.toLowerCase()) ||
        b.last_name.toLowerCase().includes(beneficiarySearch.toLowerCase()) ||
        (b.guardian &&
          b.guardian.toLowerCase().includes(beneficiarySearch.toLowerCase()));
      const matchesHeadquarter =
        headquarterFilter === "all" || b.headquarters_id === headquarterFilter;
      const matchesCategory =
        categoryBeneficiaryFilter === "all" ||
        b.category === categoryBeneficiaryFilter;
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;
      return (
        matchesSearch && matchesHeadquarter && matchesCategory && matchesStatus
      );
    });
  }, [
    beneficiaries,
    beneficiarySearch,
    headquarterFilter,
    categoryBeneficiaryFilter,
    statusFilter,
  ]);

  // Estadísticas por sede
  const sedeStats = useMemo(() => {
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

  // Project handlers
  const handleCreateProject = () => {
    toast.info("Crear proyecto", {
      description: "Funcionalidad en desarrollo",
    });
  };

  const handleEditProject = (project: Project) => {
    toast.info("Editar proyecto", {
      description: `Editando: ${project.name}`,
    });
  };

  const handleDeleteProject = (projectId: number) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    toast.success("Proyecto eliminado");
  };

  const handleSaveProject = (project: Partial<Project>) => {
    if (project.id) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id ? ({ ...p, ...project } as Project) : p,
        ),
      );
      toast.success("Proyecto actualizado");
    } else {
      const newProject = {
        ...project,
        id: Math.max(...projects.map((p) => p.id), 0) + 1,
      } as Project;
      setProjects((prev) => [...prev, newProject]);
      toast.success("Proyecto creado");
    }
  };

  // Beneficiary handlers
  const handleCreateBeneficiary = () => {
    toast.info("Crear beneficiario", {
      description: "Abre el formulario desde el componente",
    });
  };

  const handleEditBeneficiary = (beneficiary: Beneficiary) => {
    toast.info("Editar beneficiario", {
      description: `Editando: ${beneficiary.first_name} ${beneficiary.last_name}`,
    });
  };

  const handleDeleteBeneficiary = async (
    beneficiaryId: string,
    beneficiaryName: string,
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

  const handleSaveBeneficiary = async (
    beneficiaryData: CreateBeneficiaryData | UpdateBeneficiaryData,
    isEditing: boolean,
    editId?: string,
  ) => {
    try {
      // Validar con el schema correspondiente
      const schema = isEditing
        ? updateBeneficiarySchema
        : createBeneficiarySchema;
      const result = schema.safeParse(beneficiaryData);

      if (!result.success) {
        const firstError = result.error.errors[0];
        toast.error("Error de validación", {
          description: firstError.message,
        });
        return false;
      }

      if (isEditing && editId) {
        await beneficiaryService.update(
          editId,
          beneficiaryData as UpdateBeneficiaryData,
        );
        const data = beneficiaryData as UpdateBeneficiaryData;
        toast.success("Beneficiario actualizado", {
          description: `${data.first_name || ""} ${data.last_name || ""} ha sido actualizado correctamente`,
        });
      } else {
        await beneficiaryService.create(
          beneficiaryData as CreateBeneficiaryData,
        );
        const data = beneficiaryData as CreateBeneficiaryData;
        toast.success("Beneficiario creado", {
          description: `${data.first_name} ${data.last_name} ha sido agregado correctamente`,
        });
      }
      await loadBeneficiaries();
      return true;
    } catch (error) {
      console.error("Error saving beneficiary:", error);
      toast.error("Error al guardar", {
        description: "No se pudo guardar el beneficiario",
      });
      return false;
    }
  };

  const handleExportBeneficiariesExcel = (beneficiaries: Beneficiary[]) => {
    const data = mapBeneficiaryToReport(beneficiaries);
    generateBeneficiariesExcel(data, "beneficiarios");
    toast.success("Reporte Excel generado", {
      description: `Se exportaron ${data.length} beneficiarios`,
    });
  };

  const handleExportBeneficiariesPDF = (beneficiaries: Beneficiary[]) => {
    const data = mapBeneficiaryToReport(beneficiaries);
    generateBeneficiariesPDF(data, "beneficiarios");
    toast.success("Reporte PDF generado", {
      description: `Se exportaron ${data.length} beneficiarios`,
    });
  };

  // Headquarter handlers
  const handleCreateHeadquarter = () => {
    toast.info("Crear sede", {
      description: "Funcionalidad en desarrollo",
    });
  };

  const handleEditHeadquarter = (headquarter: Headquarter) => {
    toast.info("Editar sede", {
      description: `Editando: ${headquarter.name}`,
    });
  };

  const handleDeleteHeadquarter = (headquarterId: string) => {
    setHeadquarters((prev) =>
      prev.filter((h) => h.headquarters_id !== headquarterId),
    );
    toast.success("Sede eliminada");
  };

  const handleSaveHeadquarter = (headquarter: Partial<Headquarter>) => {
    if (headquarter.headquarters_id) {
      setHeadquarters((prev) =>
        prev.map((h) =>
          h.headquarters_id === headquarter.headquarters_id
            ? ({ ...h, ...headquarter } as Headquarter)
            : h,
        ),
      );
      toast.success("Sede actualizada");
    } else {
      const newHeadquarter = {
        ...headquarter,
        headquarters_id: `hq_${Date.now()}`,
      } as Headquarter;
      setHeadquarters((prev) => [...prev, newHeadquarter]);
      toast.success("Sede creada");
    }
  };

  // Utilities
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
      year: "numeric",
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
    beneficiariesLoading,
    beneficiarySearch,
    setBeneficiarySearch,
    headquarterFilter,
    setHeadquarterFilter,
    categoryBeneficiaryFilter,
    setCategoryBeneficiaryFilter,
    statusFilter,
    setStatusFilter,
    loadBeneficiaries,
    handleCreateBeneficiary,
    handleEditBeneficiary,
    handleDeleteBeneficiary,
    handleSaveBeneficiary,
    handleExportBeneficiariesExcel,
    handleExportBeneficiariesPDF,
    // Beneficiary utilities
    calculateAge,
    getStatusBadge,
    getPerformanceColor,
    filteredBeneficiaries,
    sedeStats,
    mapToReport: mapBeneficiaryToReport,

    // Headquarters
    headquarters,
    setHeadquarters,
    headquartersLoading,
    loadHeadquarters,
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
