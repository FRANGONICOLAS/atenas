import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula")
  .regex(/[0-9]/, "La contraseña debe contener al menos un número");

const usernameSchema = z
  .string()
  .min(3, "El username debe tener al menos 3 caracteres")
  .max(20, "El username no debe exceder 20 caracteres")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "El username solo puede contener letras, números y guión bajo"
  );

const emailSchema = z
  .string()
  .email("Debe ser un email válido")
  .min(1, "El email es requerido");

export const createUserSchema = z
  .object({
    first_name: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(50, "El nombre no debe exceder 50 caracteres"),
    last_name: z
      .string()
      .min(2, "El apellido debe tener al menos 2 caracteres")
      .max(50, "El apellido no debe exceder 50 caracteres"),
    birthdate: z.string().min(1, "La fecha de nacimiento es requerida"),

    username: usernameSchema,
    email: emailSchema,
    phone: z
      .string()
      .regex(/^[0-9+\-\s()]*$/, "Número de teléfono inválido")
      .optional()
      .or(z.literal("")),

    password: passwordSchema,
    confirmPassword: z.string().min(1, "Debes confirmar la contraseña"),

    // Roles se almacenan en minúsculas en user_role
    role: z.enum(["donator", "director", "admin", "director_sede"]).default("donator"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const completeGoogleUserSchema = z.object({
  first_name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no debe exceder 50 caracteres"),
  last_name: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido no debe exceder 50 caracteres"),
  birthdate: z.string().min(1, "La fecha de nacimiento es requerida"),
  username: usernameSchema,
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]*$/, "Número de teléfono inválido")
    .optional()
    .or(z.literal("")),
  // Roles se almacenan en minúsculas en user_role
  role: z.enum(["donator", "director", "admin", "director_sede"]).default("donator"),
});

export const updateUserSchema = z.object({
  first_name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no debe exceder 50 caracteres")
    .optional(),
  last_name: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido no debe exceder 50 caracteres")
    .optional(),
  birthdate: z.string().optional(),
  username: usernameSchema.optional(),
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]*$/, "Número de teléfono inválido")
    .optional(),
  profile_images_id: z.string().optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "La contraseña es requerida"),
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CompleteGoogleUserInput = z.infer<typeof completeGoogleUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
