import { AuthError } from "@supabase/supabase-js";
import { toast } from "sonner";

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AuthError) {
    // Mensajes específicos de Supabase Auth
    switch (error.message) {
      case "Invalid login credentials":
        return "Credenciales incorrectas. Por favor verifica tu email y contraseña.";
      case "Email not confirmed":
        return "Por favor confirma tu email antes de iniciar sesión.";
      case "User already registered":
        return "Este correo electrónico ya está registrado.";
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Ha ocurrido un error inesperado";
};

export const handleAuthError = (error: unknown): void => {
  const message = getErrorMessage(error);
  toast.error(message);
};

export const handleValidationError = (error: unknown): void => {
  if (error && typeof error === "object" && "errors" in error) {
    const errors = error.errors as Array<{ message: string }>;
    errors.forEach((err) => {
      toast.error(err.message);
    });
  } else {
    toast.error(getErrorMessage(error));
  }
};

export const errorMessages = {
  auth: {
    invalidCredentials: "Credenciales incorrectas",
    emailNotConfirmed: "Por favor confirma tu email",
    userExists: "El usuario ya existe",
    weakPassword: "La contraseña debe tener al menos 8 caracteres",
    invalidEmail: "Email inválido",
    sessionExpired: "Tu sesión ha expirado",
  },
  validation: {
    required: "Este campo es requerido",
    minLength: (min: number) => `Debe tener al menos ${min} caracteres`,
    maxLength: (max: number) => `No debe exceder ${max} caracteres`,
    email: "Debe ser un email válido",
    password: "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número",
    passwordMatch: "Las contraseñas no coinciden",
    username: "El username solo puede contener letras, números y guión bajo",
  },
  database: {
    createFailed: "Error al crear el registro",
    updateFailed: "Error al actualizar el registro",
    deleteFailed: "Error al eliminar el registro",
    notFound: "Registro no encontrado",
  },
};
