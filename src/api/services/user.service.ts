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
   * Obtiene el rol de un usuario por su ID desde la tabla user_role
   */
  async getUserRole(userId: string): Promise<UserRole | null> {
    const { data, error } = await client
      .from("user_role")
      .select("role_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return (data?.role_id as UserRole) || null;
  },

  /**
   * Obtiene todos los roles de un usuario por su ID desde la tabla user_role
   */
  async getUserRoles(userId: string): Promise<string[]> {
    const { data, error } = await client
      .from("user_role")
      .select("role_id")
      .eq("user_id", userId);
    if (error) throw error;
    return data?.map(r => r.role_id) || [];
  },

  /**
   * Crea un nuevo usuario en la base de datos usando una función de base de datos
   * Esto evita problemas con RLS durante el registro
   */
  async create(userData: CreateUserData): Promise<User> {
    try {
      // Intentar primero con la función de registro (más seguro para RLS)
      const { data, error } = await client
        .rpc("register_new_user", {
          user_id: userData.id,
          user_email: userData.email,
          user_username: userData.username,
          user_first_name: userData.first_name,
          user_last_name: userData.last_name,
          user_birthdate: userData.birthdate,
          user_phone: userData.phone || "",
          user_role: (userData.role || "donator").toLowerCase(), // Convert to lowercase
        });

      if (error) throw error;
      
      // Enrich user with roles from user_role table
      const roles = await this.getUserRoles(data.id);
      return { ...data, roles };
    } catch (rpcError) {
      // Si falla la función, intentar con insert directo
      console.warn("RPC insert failed, trying direct insert:", rpcError);
      const { data: userData_insert, error: insertError } = await client
        .from("user")
        .insert([{
          id: userData.id,
          email: userData.email,
          username: userData.username,
          first_name: userData.first_name,
          last_name: userData.last_name,
          birthdate: userData.birthdate,
          phone: userData.phone,
        }])
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      // Insert role manually
      const { error: roleError } = await client
        .from("user_role")
        .insert({
          user_id: userData.id,
          role_id: (userData.role || "donator").toLowerCase(),
        });
      
      if (roleError) throw roleError;
      
      const roles = await this.getUserRoles(userData.id);
      return { ...userData_insert, roles };
    }
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
