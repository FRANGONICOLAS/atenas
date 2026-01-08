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
   * Obtiene todos los usuarios con sus roles
   */
  async getAll(): Promise<User[]> {
    const { data, error } = await client
      .from("user")
      .select(`
        *,
        user_role!inner(
          role_id,
          role!inner(
            role_name
          )
        )
      `);
    if (error) throw error;
    
    // Mapear los datos para incluir los roles en el formato esperado
    return (data || []).map(user => ({
      ...user,
      roles: user.user_role?.map((ur: any) => ur.role?.role_name).filter(Boolean) || []
    }));
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
    if (!userData.id) {
      throw new Error("userService.create: user id is required");
    }

    // Si ya existe, devolverlo para evitar conflictos de email
    try {
      const existingById = await this.getById(userData.id);
      if (existingById) {
        const roles = await this.getUserRoles(userData.id);
        return { ...existingById, roles } as User;
      }
    } catch (_) {
      // Ignorar fallos de lectura por RLS en la verificación previa
    }

    try {
      const existingByEmail = await this.findByEmail(userData.email);
      if (existingByEmail) {
        const roles = await this.getUserRoles(existingByEmail.id);
        return { ...existingByEmail, roles } as User;
      }
    } catch (_) {
      // Ignorar fallos de lectura por RLS en la verificación previa
    }

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
    } catch (rpcError: any) {
      // Si es duplicado de email, devolver el existente
      const code = rpcError?.code || rpcError?.details || rpcError?.message;
      if (typeof code === "string" && code.includes("23505")) {
        try {
          const existing = await this.findByEmail(userData.email);
          if (existing) {
            const roles = await this.getUserRoles(existing.id);
            return { ...existing, roles } as User;
          }
        } catch (_) {
          // Ignorar fallo de lectura
        }
      }

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
   * Elimina un usuario por su ID usando la Edge Function
   * Esta función elimina el usuario tanto de auth.users como de las tablas relacionadas
   */
  async delete(userId: string): Promise<void> {
    // Obtener la URL de Supabase y la sesión actual
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const { data: { session } } = await client.auth.getSession();
    
    if (!session) {
      throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
    }

    // Llamar a la Edge Function para eliminar el usuario
    const response = await fetch(`${supabaseUrl}/functions/v1/Delete-users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ userId })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'No se pudo eliminar el usuario');
    }
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
