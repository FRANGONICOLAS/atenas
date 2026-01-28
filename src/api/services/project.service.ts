import { client } from "@/api/supabase/client";
import type { Database } from "@/api/types";

// Tipos basados en la base de datos
type ProjectRow = Database["public"]["Tables"]["project"]["Row"];
type ProjectInsert = Database["public"]["Tables"]["project"]["Insert"];
type ProjectUpdate = Database["public"]["Tables"]["project"]["Update"];

// Tipos para crear y actualizar proyectos
export interface CreateProjectData {
  name: string;
  category?: string | null;
  type?: string | null;
  description?: string | null;
  finance_goal?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: string;
}

export interface UpdateProjectData {
  name?: string;
  category?: string | null;
  type?: string | null;
  description?: string | null;
  finance_goal?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: string;
}

export const projectService = {
  // Obtiene todos los proyectos
  async getAll(): Promise<ProjectRow[]> {
    const { data, error } = await client
      .from("project")
      .select("*")
      .order("start_date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Obtiene las sedes de un proyecto específico
  async getHeadquartersForProject(projectId: string): Promise<string[]> {
    const { data, error } = await client
      .from("headquarters_project")
      .select("headquarters_id")
      .eq("project_id", projectId);

    if (error) throw error;
    return data?.map((item) => item.headquarters_id) || [];
  },

  // Obtiene un proyecto por su ID
  async getById(id: string): Promise<ProjectRow | null> {
    const { data, error } = await client
      .from("project")
      .select("*")
      .eq("project_id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Obtiene proyectos por categoría
  async getByCategory(category: string): Promise<ProjectRow[]> {
    const { data, error } = await client
      .from("project")
      .select("*")
      .eq("category", category)
      .order("start_date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Obtiene proyectos por tipo
  async getByType(type: string): Promise<ProjectRow[]> {
    const { data, error } = await client
      .from("project")
      .select("*")
      .eq("type", type)
      .order("start_date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Obtiene proyectos por estado
  async getByStatus(status: string): Promise<ProjectRow[]> {
    const { data, error } = await client
      .from("project")
      .select("*")
      .eq("status", status)
      .order("start_date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Busca proyectos por nombre o descripción
  async search(searchTerm: string): Promise<ProjectRow[]> {
    const { data, error } = await client
      .from("project")
      .select("*")
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order("start_date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Crea un nuevo proyecto
  async create(projectData: CreateProjectData, headquarterId?: string): Promise<ProjectRow> {
    const { data, error } = await client
      .from("project")
      .insert([
        {
          name: projectData.name,
          category: projectData.category || null,
          type: projectData.type || null,
          description: projectData.description || null,
          finance_goal: projectData.finance_goal || null,
          start_date: projectData.start_date || null,
          end_date: projectData.end_date || null,
          status: projectData.status || "active",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Si se proporciona una sede, asignar el proyecto a esa sede
    if (headquarterId && data) {
      await this.assignToHeadquarter(data.project_id, headquarterId);
    }

    return data;
  },

  // Actualiza un proyecto existente
  async update(
    projectId: string,
    updates: UpdateProjectData,
    newHeadquarterId?: string
  ): Promise<ProjectRow> {
    const { data, error } = await client
      .from("project")
      .update(updates)
      .eq("project_id", projectId)
      .select()
      .single();

    if (error) throw error;

    // Si se proporciona una nueva sede, actualizar la relación
    if (newHeadquarterId !== undefined) {
      // Primero remover todas las relaciones existentes
      await client
        .from("headquarters_project")
        .delete()
        .eq("project_id", projectId);

      // Luego agregar la nueva si existe
      if (newHeadquarterId) {
        await this.assignToHeadquarter(projectId, newHeadquarterId);
      }
    }

    return data;
  },

  // Elimina un proyecto
  async delete(projectId: string): Promise<void> {
    const { error } = await client
      .from("project")
      .delete()
      .eq("project_id", projectId);

    if (error) throw error;
  },

  // Obtiene proyectos de una sede específica
  async getByHeadquarter(headquarterId: string): Promise<ProjectRow[]> {
    const { data, error } = await client
      .from("headquarters_project")
      .select("project_id")
      .eq("headquarters_id", headquarterId);

    if (error) throw error;

    if (!data || data.length === 0) return [];

    const projectIds = data.map((item) => item.project_id);

    const { data: projects, error: projectsError } = await client
      .from("project")
      .select("*")
      .in("project_id", projectIds)
      .order("start_date", { ascending: false });

    if (projectsError) throw projectsError;
    return projects || [];
  },

  // Asigna un proyecto a una sede
  async assignToHeadquarter(
    projectId: string,
    headquarterId: string
  ): Promise<void> {
    const { error } = await client.from("headquarters_project").insert([
      {
        project_id: projectId,
        headquarters_id: headquarterId,
      },
    ]);

    if (error) throw error;
  },

  // Remueve un proyecto de una sede
  async removeFromHeadquarter(
    projectId: string,
    headquarterId: string
  ): Promise<void> {
    const { error } = await client
      .from("headquarters_project")
      .delete()
      .eq("project_id", projectId)
      .eq("headquarters_id", headquarterId);

    if (error) throw error;
  },

  // Obtiene el total recaudado de un proyecto
  async getTotalRaised(projectId: string): Promise<number> {
    const { data, error } = await client
      .from("donation")
      .select("amount")
      .eq("project_id", projectId);

    if (error) throw error;

    if (!data || data.length === 0) return 0;

    return data.reduce((sum, donation) => sum + (donation.amount || 0), 0);
  },
};
