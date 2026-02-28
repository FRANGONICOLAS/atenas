import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { client } from "@/api/supabase/client";
import { authService } from "@/api/services/auth.service";
import { userService } from "@/api/services/user.service";
import { toast } from "sonner";
import { handleAuthError } from "@/lib/errorHandler";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const error = searchParams.get("error");
        if (error) {
          toast.error("Error en la autenticación: " + error);
          navigate("/login");
          return;
        }

        const { error: exchangeError } =
          await client.auth.exchangeCodeForSession(window.location.href);

        if (exchangeError) {
          throw exchangeError;
        }

        const user = await authService.getCurrentUser();

        if (!user) {
          toast.error("No se pudo autenticar el usuario");
          navigate("/login");
          return;
        }

        const existingUser = await userService.getById(user.id);

        if (existingUser) {
          toast.success("¡Bienvenido de nuevo!");
          navigate("/");
        } else {
          toast.info("Por favor completa tu perfil");
          navigate("/complete-profile");
        }

      } catch (error) {
        console.error("Error en callback de autenticación:", error);
        handleAuthError(error);
        navigate("/login");
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Autenticando...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;