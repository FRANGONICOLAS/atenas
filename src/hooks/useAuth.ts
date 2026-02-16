import { useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { authService } from "@/api/services/auth.service";
import { userService } from "@/api/services/user.service";

interface UserWithRole extends User {
  role?: string; // Rol principal (el primero de la lista)
  roles?: string[]; // Todos los roles del usuario
  username?: string;
  first_name?: string;
  last_name?: string;
  headquarter_id?: string | null;
  hasCompletedProfile?: boolean;
}

// Enriquece el usuario de Supabase con datos de la base de datos
const enrichUserWithDBData = async (supabaseUser: User): Promise<UserWithRole> => {
  try {
    const dbUser = await userService.getById(supabaseUser.id);
    // Get all user roles from user_role table
    const userRoles = await userService.getUserRoles(supabaseUser.id);
    const meta = supabaseUser.user_metadata ?? {};
    const metaRole = typeof meta["role"] === "string" ? meta["role"] : undefined;
    
    // Si no tiene roles en la BD, usar el rol de metadata o "donator"
    const finalRoles = userRoles.length > 0 ? userRoles : [metaRole || "donator"];
    const primaryRole = finalRoles[0];

    // Verificar si el perfil está completo
    const hasCompletedProfile = !!(dbUser?.username && dbUser?.first_name && dbUser?.last_name);

    return {
      ...supabaseUser,
      role: primaryRole,
      roles: finalRoles,
      username: dbUser?.username,
      first_name: dbUser?.first_name,
      last_name: dbUser?.last_name,
      headquarter_id: dbUser?.headquarter_id ?? null,
      hasCompletedProfile,
    };
  } catch (err) {
    const meta = supabaseUser.user_metadata ?? {};
    return {
      ...supabaseUser,
      role: (meta["role"] as string) || "donator",
      roles: [(meta["role"] as string) || "donator"],
      hasCompletedProfile: false,
    };
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let isProcessing = false;

    const handleSession = async (session: Session | null) => {
      if (!mounted || isProcessing) return;
      
      isProcessing = true;

      if (session?.user) {
        try {
          const enrichedUser = await enrichUserWithDBData(session.user);
          if (mounted) {
            setUser(enrichedUser);
            setIsLoading(false);
          }
        } catch (err) {
          console.error("Error enriqueciendo usuario:", err);
          if (mounted) {
            const meta = session.user.user_metadata ?? {};
            setUser({
              ...session.user,
              role: (meta["role"] as string) || "DONATOR",
            });
            setIsLoading(false);
          }
        }
      } else {
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
      }

      isProcessing = false;
    };

    // Cargar sesión inicial
    authService.getSession().then((session) => {
      if (mounted) {
        handleSession(session);
      }
    }).catch((err) => {
      if (mounted) {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (event, session) => {
      
      if (!mounted) return;

      // Solo procesar eventos de cambio real, no los iniciales
      if (event === 'SIGNED_OUT') {
        isProcessing = false;
        setUser(null);
        setIsLoading(false);
      } else if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        await handleSession(session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signOut,
  };
};
