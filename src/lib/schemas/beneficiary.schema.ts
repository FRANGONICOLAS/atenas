import { z } from "zod";

const phoneSchema = z
  .string()
  .min(1, "El teléfono es requerido")
  .regex(/^[0-9+\-\s()]*$/, "Número de teléfono inválido");

const birthDateSchema = z
  .string()
  .min(1, "La fecha de nacimiento es requerida")
  .refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    return birthDate < today;
  }, "La fecha de nacimiento debe ser anterior a hoy")
  .refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    
    let finalAge = age;
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      finalAge--;
    }
    
    return finalAge <= 17;
  }, "El beneficiario debe tener máximo 17 años")
  .refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age <= 120;
  }, "La fecha de nacimiento no es válida");

export const createBeneficiarySchema = z.object({
  first_name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no debe exceder 50 caracteres"),
  last_name: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido no debe exceder 50 caracteres"),
  birth_date: birthDateSchema,
  category: z
    .string()
    .min(1, "La categoría es requerida"),
  headquarters_id: z
    .string()
    .min(1, "La sede es requerida"),
  phone: phoneSchema,
  registry_date: z.string().optional(),
  status: z.enum(["activo", "pendiente", "inactivo", "suspendido"]).default("activo"),
  performance: z
    .number()
    .min(0, "El rendimiento debe ser al menos 0")
    .max(100, "El rendimiento no puede exceder 100")
    .optional(),
  attendance: z
    .number()
    .min(0, "La asistencia debe ser al menos 0")
    .max(100, "La asistencia no puede exceder 100")
    .optional(),
  guardian: z
    .string()
    .max(100, "El nombre del acudiente no debe exceder 100 caracteres")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .max(200, "La dirección no debe exceder 200 caracteres")
    .optional()
    .or(z.literal("")),
  emergency_contact: z
    .string()
    .regex(/^$|^[0-9+\-\s()]*$/, "Número de contacto de emergencia inválido")
    .optional()
    .or(z.literal("")),
  medical_info: z
    .string()
    .max(500, "La información médica no debe exceder 500 caracteres")
    .optional()
    .or(z.literal("")),
});

export const updateBeneficiarySchema = z.object({
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
  birth_date: birthDateSchema.optional(),
  category: z.string().optional(),
  headquarters_id: z.string().optional(),
  phone: phoneSchema.optional(),
  registry_date: z.string().optional(),
  status: z.enum(["activo", "pendiente", "inactivo", "suspendido"]).optional(),
  performance: z
    .number()
    .min(0, "El rendimiento debe ser al menos 0")
    .max(100, "El rendimiento no puede exceder 100")
    .optional(),
  attendance: z
    .number()
    .min(0, "La asistencia debe ser al menos 0")
    .max(100, "La asistencia no puede exceder 100")
    .optional(),
  guardian: z
    .string()
    .max(100, "El nombre del acudiente no debe exceder 100 caracteres")
    .optional(),
  address: z
    .string()
    .max(200, "La dirección no debe exceder 200 caracteres")
    .optional(),
  emergency_contact: z
    .string()
    .regex(/^$|^[0-9+\-\s()]*$/, "Número de contacto de emergencia inválido")
    .optional(),
  medical_info: z
    .string()
    .max(500, "La información médica no debe exceder 500 caracteres")
    .optional(),
});

export type CreateBeneficiaryInput = z.infer<typeof createBeneficiarySchema>;
export type UpdateBeneficiaryInput = z.infer<typeof updateBeneficiarySchema>;
