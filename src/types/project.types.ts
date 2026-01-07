export type ProjectType = 'investment' | 'free';
export type ProjectPriority = 'high' | 'medium' | 'low';
export type ProjectStatus = 'active' | 'completed' | 'pending';

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
  headquarters_id?: number;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  location?: string;
  beneficiaries?: number;
  image?: string;
  currentAmount?: number;
  targetAmount?: number;
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
