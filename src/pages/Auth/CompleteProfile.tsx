import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { GenericAuthForm } from "@/components/forms";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/api/services/user.service";
import { authService } from "@/api/services/auth.service";
import { toast } from "sonner";
import { handleAuthError } from "@/lib/errorHandler";
import {
  completeGoogleUserSchema,
  type CompleteGoogleUserInput,
} from "@/lib/schemas/user.schema";
import { COMPLETE_PROFILE_FIELDS } from "@/config/authFormFields";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CompleteGoogleUserInput>({
    resolver: zodResolver(completeGoogleUserSchema),
    defaultValues: {},
  });

  // Evitar que el usuario salga sin completar el perfil
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = '';
    return '';
  };

  useEffect(() => {
    // Si el usuario ya tiene el perfil completo, redirigir al home
    if (user?.hasCompletedProfile) {
      navigate("/");
      return;
    }

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, navigate]);

  const handleSignOut = async () => {
    try {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      await signOut();
      toast.success("Sesión cerrada");
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Error al cerrar sesión");
    }
  };

  const onSubmit = async (data: CompleteGoogleUserInput) => {
    // Use getCurrentUser() for the authoritative auth user — never rely on stale React state
    const authUser = await authService.getCurrentUser().catch(() => null);
    if (!authUser?.id) {
      toast.error("No se encontró el usuario autenticado");
      navigate("/login");
      return;
    }

    setIsLoading(true);
    try {
      // Verificar si el usuario ya existe en la tabla user
      const existingUser = await userService.getById(authUser.id);

      if (existingUser) {
        // Actualizar usuario existente
        await userService.update(authUser.id, {
          first_name: data.first_name,
          last_name: data.last_name,
          birthdate: data.birthdate || null,
          username: data.username,
          phone: data.phone || null,
        });
      } else {
        // Crear nuevo usuario en la tabla user
        await userService.create({
          id: authUser.id,
          email: authUser.email!,
          first_name: data.first_name,
          last_name: data.last_name,
          birthdate: data.birthdate,
          username: data.username,
          phone: data.phone || "",
          // Rol fijo por autoservicio
          role: "donator",
        });
      }

      // Refrescar la sesión para actualizar el estado del usuario
      await authService.getSession();
      await authService.getCurrentUser();

      toast.success("¡Perfil completado exitosamente!");

      // Remover el listener antes de redirigir para no disparar el aviso del navegador
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.location.href = "/";
    } catch (error) {
      console.error("Error al completar perfil:", error);
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-4">
        <GenericAuthForm
          title="Completa tu Perfil"
          description="Solo necesitamos algunos datos adicionales"
          fields={COMPLETE_PROFILE_FIELDS}
          form={form}
          onSubmit={onSubmit}
          isLoading={isLoading}
          submitButtonText={isLoading ? "Guardando..." : "Completar Perfil"}
        />
        
        <Button
          type="button"
          variant="outline"
          className="w-full max-w-md mx-auto flex gap-2"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </AuthLayout>
  );
};

export default CompleteProfile;
