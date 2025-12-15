import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const ProfileGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Rutas que se permiten sin perfil completo
    const allowedRoutes = [
      '/complete-profile',
      '/login',
      '/registro',
      '/auth/callback',
      '/reset-password'
    ];

    // Si está cargando, no hacer nada
    if (isLoading) return;

    // Si el usuario está autenticado, no tiene perfil completo, y no está en una ruta permitida
    if (
      isAuthenticated && 
      user && 
      !user.hasCompletedProfile && 
      !allowedRoutes.includes(location.pathname)
    ) {
      navigate('/complete-profile', { replace: true });
    }
  }, [user, isLoading, isAuthenticated, location.pathname, navigate]);

  return <>{children}</>;
};
