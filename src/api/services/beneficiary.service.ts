import { client } from "@/api/supabase/client";
import { storageService } from "./storage.service";
import type {
  Beneficiary,
  CreateBeneficiaryData,
  UpdateBeneficiaryData,
} from "@/types/beneficiary.types";

export const beneficiaryService = {
  // Obtiene todos los beneficiarios
  async getAll(): Promise<Beneficiary[]> {
    const { data, error } = await client
      .from("beneficiary")
      .select("*")
      .order("registry_date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Obtiene un beneficiario por su ID
  async getById(id: string): Promise<Beneficiary | null> {
    const { data, error } = await client
      .from("beneficiary")
      .select("*")
      .eq("beneficiary_id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Obtiene todos los beneficiarios de una sede específica
  async getByHeadquarterId(headquarterId: string): Promise<Beneficiary[]> {
    const { data, error } = await client
      .from("beneficiary")
      .select("*")
      .eq("headquarters_id", headquarterId)
      .order("registry_date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Obtiene beneficiarios por categoría
  async getByCategory(category: string): Promise<Beneficiary[]> {
    const { data, error } = await client
      .from("beneficiary")
      .select("*")
      .eq("category", category)
      .order("registry_date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Obtiene beneficiarios por sede y categoría
  async getByHeadquarterAndCategory(
    headquarterId: string,
    category: string,
  ): Promise<Beneficiary[]> {
    const { data, error } = await client
      .from("beneficiary")
      .select("*")
      .eq("headquarters_id", headquarterId)
      .eq("category", category)
      .order("registry_date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Busca beneficiarios por nombre o apellido
  async searchByName(searchTerm: string): Promise<Beneficiary[]> {
    const { data, error } = await client
      .from("beneficiary")
      .select("*")
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
      .order("first_name", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtiene beneficiarios por estado
   */
  async getByStatus(status: string): Promise<Beneficiary[]> {
    const { data, error } = await client
      .from("beneficiary")
      .select("*")
      .eq("status", status)
      .order("registry_date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtiene beneficiarios con bajo rendimiento
   */
  async getLowPerformance(threshold: number = 60): Promise<Beneficiary[]> {
    const { data, error } = await client
      .from("beneficiary")
      .select("*")
      .lt("performance", threshold)
      .order("performance", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtiene beneficiarios con baja asistencia
   */
  async getLowAttendance(threshold: number = 80): Promise<Beneficiary[]> {
    const { data, error } = await client
      .from("beneficiary")
      .select("*")
      .lt("attendance", threshold)
      .order("attendance", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Crea un nuevo beneficiario
  async create(beneficiaryData: CreateBeneficiaryData): Promise<Beneficiary> {
    const { data, error } = await client
      .from("beneficiary")
      .insert([
        {
          headquarters_id: beneficiaryData.headquarters_id,
          first_name: beneficiaryData.first_name,
          last_name: beneficiaryData.last_name,
          birth_date: beneficiaryData.birth_date,
          category: beneficiaryData.category,
          phone: beneficiaryData.phone,
          registry_date:
            beneficiaryData.registry_date ||
            new Date().toISOString().split("T")[0],
          status: beneficiaryData.status || "activo",
          sex: beneficiaryData.sex,
          performance: beneficiaryData.performance,
          attendance: beneficiaryData.attendance,
          guardian: beneficiaryData.guardian,
          address: beneficiaryData.address,
          emergency_contact: beneficiaryData.emergency_contact,
          medical_info: beneficiaryData.medical_info,
          observation: beneficiaryData.observation,
          anthropometric_detail: beneficiaryData.anthropometric_detail,
          technical_tactic_detail: beneficiaryData.technical_tactic_detail,
          emotional_detail: beneficiaryData.emotional_detail,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Actualiza un beneficiario existente
  async update(
    beneficiaryId: string,
    updates: UpdateBeneficiaryData,
  ): Promise<Beneficiary> {
    const { data, error } = await client
      .from("beneficiary")
      .update(updates)
      .eq("beneficiary_id", beneficiaryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Elimina un beneficiario
  async delete(beneficiaryId: string): Promise<void> {
    const { error } = await client
      .from("beneficiary")
      .delete()
      .eq("beneficiary_id", beneficiaryId);

    if (error) throw error;
  },

  // Cuenta el total de beneficiarios
  async count(): Promise<number> {
    const { count, error } = await client
      .from("beneficiary")
      .select("*", { count: "exact", head: true });

    if (error) throw error;
    return count || 0;
  },

  // Cuenta beneficiarios por sede
  async countByHeadquarter(headquarterId: string): Promise<number> {
    const { count, error } = await client
      .from("beneficiary")
      .select("*", { count: "exact", head: true })
      .eq("headquarters_id", headquarterId);

    if (error) throw error;
    return count || 0;
  },

  // Cuenta beneficiarios por categoría
  async countByCategory(category: string): Promise<number> {
    const { count, error } = await client
      .from("beneficiary")
      .select("*", { count: "exact", head: true })
      .eq("category", category);

    if (error) throw error;
    return count || 0;
  },

  // Sube una foto de perfil de beneficiario y retorna la URL
  async uploadPhoto(beneficiaryId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${beneficiaryId}-${Date.now()}.${fileExt}`;
    const filePath = `beneficiaries/${fileName}`;

    // Subir archivo
    await storageService.uploadFile('images', filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

    // Obtener URL pública
    const publicUrl = storageService.getPublicUrl('images', filePath);
    return publicUrl;
  },
};
