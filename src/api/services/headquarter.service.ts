import { client } from "@/api/supabase/client";
import type {
  Headquarter,
  CreateHeadquarterData,
  UpdateHeadquarterData,
} from "@/types/headquarter.types";
import type { Project } from "@/types/project.types";

export const headquarterService = {
  // Obtiene todas las sedes
  async getAll(): Promise<Headquarter[]> {
    const { data, error } = await client
      .from("headquarters")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Obtiene una sede por su ID
  async getById(id: string): Promise<Headquarter | null> {
    const { data, error } = await client
      .from("headquarters")
      .select("*")
      .eq("headquarters_id", id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  // Obtiene todas las sedes de un director específico
  async getByDirectorId(userId: string): Promise<Headquarter[]> {
    const { data, error } = await client
      .from("headquarters")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Obtiene sedes por estado
  async getByStatus(status: string): Promise<Headquarter[]> {
    const { data, error } = await client
      .from("headquarters")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Crea una nueva sede
  async create(headquarterData: CreateHeadquarterData): Promise<Headquarter> {
    const { data, error } = await client
      .from("headquarters")
      .insert([{
        name: headquarterData.name,
        address: headquarterData.address || null,
        city: headquarterData.city || null,
        status: headquarterData.status || "active",
        user_id: headquarterData.user_id,
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Actualiza una sede existente
  async update(headquarterId: string, updates: UpdateHeadquarterData): Promise<Headquarter> {
    const { data, error } = await client
      .from("headquarters")
      .update(updates)
      .eq("headquarters_id", headquarterId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Elimina una sede
  async delete(headquarterId: string): Promise<void> {
    const { error } = await client
      .from("headquarters")
      .delete()
      .eq("headquarters_id", headquarterId);
    
    if (error) throw error;
  },

  // Obtiene el conteo de beneficiarios por sede
  async getBeneficiaryCount(headquarterId: string): Promise<number> {
    const { count, error } = await client
      .from("beneficiary")
      .select("*", { count: "exact", head: true })
      .eq("headquarters_id", headquarterId);
    
    if (error) throw error;
    return count || 0;
  },

  // Obtiene los proyectos asignados a una sede
  async getProjects(headquarterId: string): Promise<{ project: Project }[]> {
    const { data, error } = await client
      .from("headquarters_project")
      .select(`
        *,
        project:project_id (*)
      `)
      .eq("headquarters_id", headquarterId);
    
    if (error) throw error;
    return data || [];
  },

  // Asigna un proyecto a una sede
  async assignProject(headquarterId: string, projectId: string): Promise<void> {
    const { error } = await client
      .from("headquarters_project")
      .insert([{
        headquarters_id: headquarterId,
        project_id: projectId,
      }]);
    
    if (error) throw error;
  },

  // Desasigna un proyecto de una sede
  async unassignProject(headquarterId: string, projectId: string): Promise<void> {
    const { error } = await client
      .from("headquarters_project")
      .delete()
      .eq("headquarters_id", headquarterId)
      .eq("project_id", projectId);
    
    if (error) throw error;
  },

  // Busca sedes por nombre
  async searchByName(name: string): Promise<Headquarter[]> {
    const { data, error } = await client
      .from("headquarters")
      .select("*")
      .ilike("name", `%${name}%`)
      .order("name");
    
    if (error) throw error;
    return data || [];
  },
};
