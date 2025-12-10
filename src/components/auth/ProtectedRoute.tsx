import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/api/types/database.types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({
  children,
  allowedRoles,
}: ProtectedRouteProps) => {
  const { user, isLoading, isAuthenticated } = useAuth();

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

  // Verificar roles permitidos si se especifican
  if (allowedRoles && user?.role) {
    if (!allowedRoles.includes(user.role as UserRole)) {
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
