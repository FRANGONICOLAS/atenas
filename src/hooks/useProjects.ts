import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { projectService } from "@/api/services";
import type { Project } from "@/types";
import type { CreateProjectData, UpdateProjectData } from "@/api/services/project.service";
import { FIVE_MINUTES_MS, getTimedCache, setTimedCache } from "@/lib/timedCache";
import {
  createProjectSchema,
  updateProjectSchema,
} from "@/lib/schemas/project.schema";

const PROJECTS_CACHE_KEY = "projects:all";

export const useProjects = () => {
  const cachedProjects = getTimedCache<Project[]>(PROJECTS_CACHE_KEY);

  // Projects state
  const [projects, setProjects] = useState<Project[]>(cachedProjects ?? []);
  const [projectsLoading, setProjectsLoading] = useState(!cachedProjects);
  const [projectSearch, setProjectSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Cargar proyectos desde Supabase
  const loadProjects = async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cached = getTimedCache<Project[]>(PROJECTS_CACHE_KEY);
        if (cached) {
          setProjects(cached);
          setProjectsLoading(false);
          return;
        }
      }

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
      setTimedCache(PROJECTS_CACHE_KEY, projectsWithRaised, FIVE_MINUTES_MS);
    } catch (error) {
      toast.error("Error al cargar proyectos");
    } finally {
      setProjectsLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    void loadProjects();
  }, []);

  // Estadísticas de proyectos
  const stats = useMemo(() => {
    const total = projects.length;
    const totalGoal = projects.reduce((sum, p) => sum + p.goal, 0);
    const totalRaised = projects.reduce((sum, p) => sum + p.raised, 0);
    const totalRaisedFree = projects
      .filter((p) => p.type === "free")
      .reduce((sum, p) => sum + p.raised, 0);
    const completedCount = projects.filter((p) => p.progress >= 100).length;
    const inProgress = total - completedCount;

    return {
      total,
      inProgress,
      totalGoal,
      totalRaised,
      totalRaisedFree,
      completedCount,
    };
  }, [projects]);

  // Project handlers
  const handleCreateProject = async (projectData: CreateProjectData, headquarterId?: string) => {
    try {
      await projectService.create(projectData, headquarterId);
      await loadProjects(true);
      toast.success("Proyecto creado", {
        description: `${projectData.name} ha sido creado correctamente`,
      });
      return true;
    } catch (error) {
      toast.error("Error al crear proyecto");
      return false;
    }
  };

  const handleEditProject = async (projectId: string, projectData: UpdateProjectData, headquarterId?: string) => {
    try {
      await projectService.update(projectId, projectData, headquarterId);
      await loadProjects(true);
      toast.success("Proyecto actualizado", {
        description: `${projectData.name || "El proyecto"} ha sido actualizado correctamente`,
      });
      return true;
    } catch (error) {
      toast.error("Error al actualizar proyecto");
      return false;
    }
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    try {
      // Verificar si el proyecto tiene donaciones
      const totalRaised = await projectService.getTotalRaised(projectId);
      
      if (totalRaised > 0) {
        toast.error("No se puede eliminar", {
          description: "No puedes eliminar un proyecto que tiene donaciones asociadas",
        });
        return;
      }

      await projectService.delete(projectId);
      await loadProjects(true);
      toast.success("Proyecto eliminado", {
        description: `${projectName} ha sido eliminado`,
      });
    } catch (error) {
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
      return false;
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

    // Stats
    stats,

    // Utilities
    formatCurrency,
    formatDate,
  };
};
