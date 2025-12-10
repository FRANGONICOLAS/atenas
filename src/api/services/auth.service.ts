import { client } from "@/api/supabase/client";
import type { Session } from "@supabase/supabase-js";

export const authService = {
  // Obtiene la sesión actual del usuario
  async getSession() {
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Obtiene el usuario autenticado actual
  async getCurrentUser() {
    const { data, error } = await client.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  // Registra un nuevo usuario
  async signUp(
    email: string,
    password: string,
    metadata?: Record<string, unknown>
  ) {
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) throw error;
    return data;
  },

  // Inicia sesión con email y contraseña
  async signIn(email: string, password: string) {
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Inicia sesión con un proveedor externo (Google)
  async signInWithProvider() {
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  },

  // Cierra la sesión del usuario actual
  async signOut() {
    const { error } = await client.auth.signOut();
    if (error) throw error;
  },

  // Actualiza el usuario autenticado
  async updateUser(attributes: {
    email?: string;
    password?: string;
    data?: Record<string, unknown>;
  }) {
    const { data, error } = await client.auth.updateUser(attributes);
    if (error) throw error;
    return data;
  },

  // Envía un email de recuperación de contraseña
  async resetPasswordForEmail(email: string) {
    const { data, error } = await client.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return data;
  },

  // Escucha cambios en el estado de autenticación
  onAuthStateChange(
    callback: (event: string, session: Session | null) => void
  ) {
    return client.auth.onAuthStateChange(callback);
  },
};
