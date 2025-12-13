import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, User, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Role selection removed for self-service; default role is donator
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/api/services/user.service";
import { toast } from "sonner";
import { handleAuthError } from "@/lib/errorHandler";
import {
  completeGoogleUserSchema,
  type CompleteGoogleUserInput,
} from "@/lib/schemas/user.schema";
import { DatePicker } from "@/components/ui/date-picker";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompleteGoogleUserInput>({
    resolver: zodResolver(completeGoogleUserSchema),
    defaultValues: {},
  });

  const onSubmit = async (data: CompleteGoogleUserInput) => {
    if (!user || !user.id) {
      toast.error("No se encontró el usuario autenticado");
      navigate("/login");
      return;
    }

    setIsLoading(true);
    try {
      // Verificar si el usuario ya existe en la tabla user
      const existingUser = await userService.getById(user.id);
      
      if (existingUser) {
        // Actualizar usuario existente
        await userService.update(user.id, {
          first_name: data.first_name,
          last_name: data.last_name,
          birthdate: data.birthdate || null,
          username: data.username,
          phone: data.phone || null,
        });
      } else {
        // Crear nuevo usuario en la tabla user
        await userService.create({
          id: user.id,
          email: user.email!,
          first_name: data.first_name,
          last_name: data.last_name,
          birthdate: data.birthdate,
          username: data.username,
          phone: data.phone || "",
          // Rol fijo por autoservicio
          role: "donator",
        });
      }

      // El hook useAuth se actualizará automáticamente al cambiar los datos

      toast.success("¡Perfil completado exitosamente!");
      navigate("/");
    } catch (error) {
      console.error("Error al completar perfil:", error);
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-background flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Completa tu Perfil</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Solo necesitamos algunos datos adicionales
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nombre */}
            <div>
              <Label htmlFor="first_name">Nombre</Label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="first_name"
                  placeholder="Tu nombre"
                  className="pl-10"
                  {...register("first_name")}
                />
              </div>
              {errors.first_name && (
                <p className="text-sm text-destructive mt-1">
                  {errors.first_name.message}
                </p>
              )}
            </div>

            {/* Apellido */}
            <div>
              <Label htmlFor="last_name">Apellido</Label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="last_name"
                  placeholder="Tu apellido"
                  className="pl-10"
                  {...register("last_name")}
                />
              </div>
              {errors.last_name && (
                <p className="text-sm text-destructive mt-1">
                  {errors.last_name.message}
                </p>
              )}
            </div>

            {/* Username */}
            <div>
              <Label htmlFor="username">Username</Label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="username"
                  placeholder="username123"
                  className="pl-10"
                  {...register("username")}
                />
              </div>
              {errors.username && (
                <p className="text-sm text-destructive mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Fecha de nacimiento */}
            <div>
              <Label htmlFor="birthdate">Fecha de Nacimiento</Label>
              <div className="mt-2">
                <DatePicker
                  date={watch("birthdate") ? new Date(watch("birthdate") + 'T12:00:00') : undefined}
                  onDateChange={(date) => {
                    if (date) {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      setValue("birthdate", `${year}-${month}-${day}`);
                    } else {
                      setValue("birthdate", "");
                    }
                  }}
                  placeholder="Selecciona tu fecha de nacimiento"
                />
              </div>
              {errors.birthdate && (
                <p className="text-sm text-destructive mt-1">
                  {errors.birthdate.message}
                </p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <div className="relative mt-2">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+57 300 123 4567"
                  className="pl-10"
                  {...register("phone")}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>


            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Guardando..." : "Completar Perfil"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteProfile;
