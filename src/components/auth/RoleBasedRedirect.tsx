import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const RoleBasedRedirect = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Mostrar loader mientras carga
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Si no está autenticado o no tiene perfil completo, mostrar página pública
  if (!isAuthenticated || !user?.hasCompletedProfile) {
    return <>{children}</>;
  }

  // Redirigir según el rol principal del usuario
  const userRoles = user?.roles || [];
  
  // Prioridad de roles para redirección
  if (userRoles.includes('admin')) {
    return <Navigate to="/admin" replace />;
  }
  
  if (userRoles.includes('director')) {
    return <Navigate to="/director" replace />;
  }
  
  if (userRoles.includes('director_sede')) {
    return <Navigate to="/director-sede" replace />;
  }
  
  if (userRoles.includes('entrenador')) {
    return <Navigate to="/profile" replace />;
  }
  
  if (userRoles.includes('donator')) {
    return <Navigate to="/donator" replace />;
  }

  // Si no tiene ningún rol conocido, mostrar la página pública
  return <>{children}</>;
};
