import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  category: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  finance_goal: z.number().min(0, "La meta debe ser mayor o igual a 0").optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  status: z.enum(["active", "completed", "pending"]).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").optional(),
  category: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  finance_goal: z.number().min(0, "La meta debe ser mayor o igual a 0").optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  status: z.enum(["active", "completed", "pending"]).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
