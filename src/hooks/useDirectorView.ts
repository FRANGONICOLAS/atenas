import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { beneficiaryService, headquarterService, projectService } from "@/api/services";
import type { Project, Headquarter, ProjectDB } from "@/types";
import type { CreateProjectData, UpdateProjectData } from "@/api/services/project.service";
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
  createProjectSchema,
  updateProjectSchema,
} from "@/lib/schemas/project.schema";
import {
  generateBeneficiariesExcel,
  generateBeneficiariesPDF,
} from "@/lib/reportGenerator";

export const useDirectorView = () => {
  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
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

  // Cargar proyectos desde Supabase
  const loadProjects = async () => {
    try {
      setProjectsLoading(true);
      const data = await projectService.getAll();
      
      // Convertir proyectos de BD a formato de la UI
      const projectsWithRaised = await Promise.all(
        data.map(async (p) => {
          const raised = await projectService.getTotalRaised(p.project_id);
          const goal = p.finance_goal || 0;
          const progress = goal > 0 ? Math.round((raised / goal) * 100) : 0;
          
          // Obtener las sedes del proyecto
          const headquarterIds = await projectService.getHeadquartersForProject(p.project_id);
          const headquarterId = headquarterIds.length > 0 ? headquarterIds[0] : undefined;
          
          return {
            id: parseInt(p.project_id.split('_')[1] || '0'),
            project_id: p.project_id,
            name: p.name,
            category: p.category || "Sin categoría",
            type: (p.type as "investment" | "free") || "investment",
            goal: goal,
            raised: raised,
            progress: progress,
            priority: "medium" as const,
            deadline: p.end_date || "",
            description: p.description || "",
            status: p.status as "active" | "completed" | "pending",
            start_date: p.start_date,
            end_date: p.end_date,
            finance_goal: p.finance_goal,
            headquarters_id: headquarterId,
          };
        })
      );
      
      setProjects(projectsWithRaised);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Error al cargar proyectos");
    } finally {
      setProjectsLoading(false);
    }
  };

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
    loadProjects();
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
  const handleCreateProject = async (projectData: CreateProjectData, headquarterId?: string) => {
    try {
      await projectService.create(projectData, headquarterId);
      await loadProjects();
      toast.success("Proyecto creado", {
        description: `${projectData.name} ha sido creado correctamente`,
      });
      return true;
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Error al crear proyecto");
      return false;
    }
  };

  const handleEditProject = async (projectId: string, projectData: UpdateProjectData, headquarterId?: string) => {
    try {
      await projectService.update(projectId, projectData, headquarterId);
      await loadProjects();
      toast.success("Proyecto actualizado", {
        description: `${projectData.name || "El proyecto"} ha sido actualizado correctamente`,
      });
      return true;
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Error al actualizar proyecto");
      return false;
    }
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    try {
      await projectService.delete(projectId);
      await loadProjects();
      toast.success("Proyecto eliminado", {
        description: `${projectName} ha sido eliminado`,
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Error al eliminar proyecto");
      throw error;
    }
  };

  const handleSaveProject = async (
    projectData: CreateProjectData | UpdateProjectData,
    isEditing: boolean,
    editId?: string,
    headquarterId?: string,
  ) => {
    try {
      // Validar con el schema correspondiente
      const schema = isEditing ? updateProjectSchema : createProjectSchema;
      const result = schema.safeParse(projectData);

      if (!result.success) {
        const firstError = result.error.errors[0];
        toast.error("Error de validación", {
          description: firstError.message,
        });
        return false;
      }

      if (isEditing && editId) {
        return await handleEditProject(editId, projectData as UpdateProjectData, headquarterId);
      } else {
        return await handleCreateProject(projectData as CreateProjectData, headquarterId);
      }
    } catch (error) {
      console.error("Error saving project:", error);
      return false;
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
    projectsLoading,
    loadProjects,
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
