import type { Database } from "@/api/types/database.types";

export type ProjectType = 'investment' | 'free';
export type ProjectPriority = 'high' | 'medium' | 'low';
export type ProjectStatus = 'active' | 'completed' | 'pending';

// Tipo de la base de datos
export type ProjectDB = Database["public"]["Tables"]["project"]["Row"];

export interface Project {
  id: number;
  name: string;
  category: string;
  type: ProjectType;
  goal: number;
  raised: number;
  progress: number;
  priority: ProjectPriority;
  deadline: string;
  description: string;
  headquarters_id?: number | string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  location?: string;
  beneficiaries?: number;
  image?: string;
  currentAmount?: number;
  targetAmount?: number;
  // Campos de la BD
  project_id?: string;
  finance_goal?: number | null;
  start_date?: string | null;
  end_date?: string | null;
}

export interface ProjectReport {
  id: number;
  name: string;
  category: string;
  goal: number;
  raised: number;
  progress: number;
  status: string;
}
