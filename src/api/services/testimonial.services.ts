import { client } from "@/api/supabase/client";
import type {
  Testimonial,
  CreateTestimonialData,
  UpdateTestimonialData,
} from "@/types/testimonial.types";

export const testimonialService = {
  // Obtiene todos los testimonios
  async getAll(): Promise<Testimonial[]> {
    const { data, error } = await client
      .from("testimonial")
      .select("*")
      .order("date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Obtiene testimonios aprobados para vista pública con información del usuario
  async getApproved(): Promise<any[]> {
    const { data, error } = await client
      .from("testimonial")
      .select(`
        *,
        user:user_id (
          first_name,
          last_name,
          profile_images_id
        )
      `)
      .eq("approve", true)
      .order("date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Obtiene un testimonio por su ID
  async getById(id: string): Promise<Testimonial | null> {
    const { data, error } = await client
      .from("testimonial")
      .select("*")
      .eq("testimonial_id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Obtiene testimonios por usuario
  async getByUserId(userId: string): Promise<Testimonial[]> {
    const { data, error } = await client
      .from("testimonial")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Obtiene testimonios por beneficiario
  async getByBeneficiaryId(beneficiaryId: string): Promise<Testimonial[]> {
    const { data, error } = await client
      .from("testimonial")
      .select("*")
      .eq("beneficiary_id", beneficiaryId)
      .order("date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Obtiene testimonios por estado
  async getByStatus(status: string): Promise<Testimonial[]> {
    const { data, error } = await client
      .from("testimonial")
      .select("*")
      .eq("status", status)
      .order("date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Crea un nuevo testimonio
  async create(testimonialData: CreateTestimonialData): Promise<Testimonial> {
    const { data, error } = await client
      .from("testimonial")
      .insert([
        {
          beneficiary_id: testimonialData.beneficiary_id,
          user_id: testimonialData.user_id,
          title: testimonialData.title,
          content: testimonialData.content,
          rating: testimonialData.rating,
          status: testimonialData.status || "pending",
          date: testimonialData.date || new Date().toISOString().split("T")[0],
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Actualiza un testimonio existente
  async update(
    testimonialId: string,
    updates: UpdateTestimonialData
  ): Promise<Testimonial> {
    const { data, error } = await client
      .from("testimonial")
      .update(updates)
      .eq("testimonial_id", testimonialId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Aprueba un testimonio
  async approve(testimonialId: string): Promise<Testimonial> {
    return await this.update(testimonialId, {
      approve: true,
      status: "approved",
    });
  },

  // Rechaza un testimonio
  async reject(testimonialId: string): Promise<Testimonial> {
    return await this.update(testimonialId, {
      approve: false,
      status: "rejected",
    });
  },

  // Elimina un testimonio
  async delete(testimonialId: string): Promise<void> {
    const { error } = await client
      .from("testimonial")
      .delete()
      .eq("testimonial_id", testimonialId);

    if (error) throw error;
  },

  // Cuenta el total de testimonios
  async count(): Promise<number> {
    const { count, error } = await client
      .from("testimonial")
      .select("*", { count: "exact", head: true });

    if (error) throw error;
    return count || 0;
  },

  // Cuenta testimonios aprobados
  async countApproved(): Promise<number> {
    const { count, error } = await client
      .from("testimonial")
      .select("*", { count: "exact", head: true })
      .eq("approve", true);

    if (error) throw error;
    return count || 0;
  },
};
