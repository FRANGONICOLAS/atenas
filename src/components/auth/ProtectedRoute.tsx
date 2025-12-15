import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/api/types/database.types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireCompleteProfile?: boolean;
}

export const ProtectedRoute = ({
  children,
  allowedRoles,
  requireCompleteProfile = true,
}: ProtectedRouteProps) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Mostrar loader mientras carga la sesión
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirigir a login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar si requiere perfil completo y no lo tiene (excepto en la propia página de complete-profile)
  if (requireCompleteProfile && !user?.hasCompletedProfile && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  // Verificar roles permitidos si se especifican
  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = (user?.roles || []).map(r => r.toLowerCase() as UserRole);
    const hasAccess = userRoles.some(role => allowedRoles.includes(role));
    
    if (!hasAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive">
              Acceso Denegado
            </h1>
            <p className="mt-2 text-muted-foreground">
              No tienes permisos para acceder a esta página
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};
