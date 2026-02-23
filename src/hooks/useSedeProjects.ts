import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { headquarterService, projectService, userService } from "@/api/services";
import { useAuth } from "@/hooks/useAuth";
import type { Project } from "@/types";
import type { CreateProjectData, UpdateProjectData } from "@/api/services/project.service";
import {
  createProjectSchema,
  updateProjectSchema,
} from "@/lib/schemas/project.schema";

export const applySedeProjectFilters = (
  projects: Project[],
  search: string,
  categoryFilter: string,
  priorityFilter: string,
  typeFilter: string,
) => {
  return projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || project.category === categoryFilter;
    const matchesPriority =
      priorityFilter === "all" || project.priority === priorityFilter;
    const matchesType = typeFilter === "all" || project.type === typeFilter;

    return matchesSearch && matchesCategory && matchesPriority && matchesType;
  });
};

export const useSedeProjects = () => {
  const { user, isLoading: authLoading } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [assignedHeadquarterId, setAssignedHeadquarterId] = useState<string | null>(null);
  const [assignedHeadquarterName, setAssignedHeadquarterName] = useState<string | null>(null);
  const [headquartersLoading, setHeadquartersLoading] = useState(true);

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
      setHeadquartersLoading(false);
      toast.error("Sesion invalida", {
        description: "No se pudo identificar al usuario autenticado.",
      });
      return;
    }

    try {
      setHeadquartersLoading(true);

      let directorHeadquarters = await resolveHeadquarterFromUser();

      if (directorHeadquarters.length === 0) {
        directorHeadquarters = await headquarterService.getByDirectorId(user.id);
      }

      if (directorHeadquarters.length === 0) {
        directorHeadquarters = await resolveHeadquarterFromMetadata();
      }

      if (directorHeadquarters.length === 0) {
        setAssignedHeadquarterId(null);
        setAssignedHeadquarterName(null);
        toast.error("Sede no asignada", {
          description: "No se encontro una sede asociada a este usuario.",
        });
        return;
      }

      const assigned = directorHeadquarters[0];
      setAssignedHeadquarterId(assigned.headquarters_id);
      setAssignedHeadquarterName(assigned.name);
    } catch (error) {
      console.error("Error loading assigned headquarter:", error);
      toast.error("Error al cargar sede", {
        description: "No se pudo obtener la sede asignada.",
      });
    } finally {
      setHeadquartersLoading(false);
    }
  };

  const mapProjectRow = async (projectRow: any, headquarterId: string) => {
    const raised = await projectService.getTotalRaised(projectRow.project_id);
    const goal = projectRow.finance_goal || 0;
    const progress = goal > 0 ? Math.round((raised / goal) * 100) : 0;

    return {
      id: parseInt(projectRow.project_id?.split("_")[1] || "0"),
      project_id: projectRow.project_id,
      name: projectRow.name,
      category: projectRow.category || "Sin categoria",
      type: (projectRow.type as "investment" | "free") || "investment",
      goal,
      raised,
      progress,
      priority: "medium" as const,
      deadline: projectRow.end_date || "",
      description: projectRow.description || "",
      status: projectRow.status as "active" | "completed" | "pending",
      start_date: projectRow.start_date,
      end_date: projectRow.end_date,
      finance_goal: projectRow.finance_goal,
      headquarters_id: headquarterId,
    } as Project;
  };

  const loadProjects = async (headquarterId: string | null) => {
    if (!headquarterId) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await projectService.getByHeadquarter(headquarterId);
      const mapped = await Promise.all(
        data.map((projectRow) => mapProjectRow(projectRow, headquarterId)),
      );
      setProjects(mapped);
    } catch (error) {
      console.error("Error loading sede projects:", error);
      toast.error("Error al cargar proyectos", {
        description: "No se pudieron cargar los proyectos de la sede.",
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
    void loadProjects(assignedHeadquarterId);
  }, [assignedHeadquarterId]);

  const filtered = useMemo(() => {
    return applySedeProjectFilters(
      projects,
      search,
      categoryFilter,
      priorityFilter,
      typeFilter,
    );
  }, [projects, search, categoryFilter, priorityFilter, typeFilter]);

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

  const handleCreateProject = async (
    projectData: CreateProjectData,
    headquarterId: string,
  ) => {
    try {
      await projectService.create(projectData, headquarterId);
      await loadProjects(headquarterId);
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

  const handleEditProject = async (
    projectId: string,
    projectData: UpdateProjectData,
    headquarterId: string,
  ) => {
    try {
      await projectService.update(projectId, projectData, headquarterId);
      await loadProjects(headquarterId);
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
      await loadProjects(assignedHeadquarterId);
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
  ) => {
    if (!assignedHeadquarterId) {
      toast.error("Sede no asignada", {
        description: "No se puede guardar un proyecto sin sede asignada.",
      });
      return false;
    }

    try {
      const schema = isEditing ? updateProjectSchema : createProjectSchema;
      const result = schema.safeParse(projectData);

      if (!result.success) {
        const firstError = result.error.errors[0];
        toast.error("Error de validacion", {
          description: firstError.message,
        });
        return false;
      }

      if (isEditing && editId) {
        return await handleEditProject(
          editId,
          projectData as UpdateProjectData,
          assignedHeadquarterId,
        );
      }

      return await handleCreateProject(
        projectData as CreateProjectData,
        assignedHeadquarterId,
      );
    } catch (error) {
      console.error("Error saving project:", error);
      return false;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return {
    projects,
    filtered,
    loading,
    search,
    categoryFilter,
    priorityFilter,
    typeFilter,
    stats,
    assignedHeadquarterId,
    assignedHeadquarterName,
    headquartersLoading,
    setSearch,
    setCategoryFilter,
    setPriorityFilter,
    setTypeFilter,
    handleSaveProject,
    handleDeleteProject,
    formatCurrency,
  };
};
