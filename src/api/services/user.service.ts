import { client } from "@/api/supabase/client";
import type {
  User,
  CreateUserData,
  UpdateUserData,
  UserRole,
} from "@/api/types/database.types";

/**
 * Servicio para operaciones con la tabla 'user'
 * Centraliza todas las queries relacionadas con usuarios
 */
export const userService = {
  /**
   * Obtiene todos los usuarios
   */
  async getAll(): Promise<User[]> {
    const { data, error } = await client.from("user").select("*");
    if (error) throw error;
    return data || [];
  },

  /**
   * Obtiene un usuario por su ID
   */
  async getById(id: string): Promise<User | null> {
    const { data, error } = await client
      .from("user")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  /**
   * Obtiene el rol de un usuario por su ID
   */
  async getUserRole(userId: string): Promise<UserRole | null> {
    const { data, error } = await client
      .from("user")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    return data?.role || null;
  },

  /**
   * Crea un nuevo usuario en la base de datos
   */
  async create(userData: CreateUserData): Promise<User> {
    const { data, error } = await client
      .from("user")
      .insert([userData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Actualiza un usuario existente
   */
  async update(userId: string, updates: UpdateUserData): Promise<User> {
    const { data, error } = await client
      .from("user")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Actualiza la imagen de perfil de un usuario
   */
  async updateProfileImage(userId: string, imageUrl: string): Promise<User> {
    const { data, error } = await client
      .from("user")
      .update({ profile_images_id: imageUrl })
      .eq("id", userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Elimina un usuario por su ID
   */
  async delete(userId: string): Promise<void> {
    const { error } = await client.from("user").delete().eq("id", userId);
    if (error) throw error;
  },

  /**
   * Busca usuarios por email
   */
  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await client
      .from("user")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  /**
   * Busca usuarios por username
   */
  async findByUsername(username: string): Promise<User | null> {
    const { data, error } = await client
      .from("user")
      .select("*")
      .eq("username", username)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  /**
   * Obtiene usuarios por rol
   */
  async getByRole(role: UserRole): Promise<User[]> {
    const { data, error } = await client
      .from("user")
      .select("*")
      .eq("role", role);
    if (error) throw error;
    return data || [];
  },
};
