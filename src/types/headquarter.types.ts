export type HeadquarterStatus = 'active' | 'inactive' | 'maintenance';

export interface Headquarter {
  headquarters_id: string;
  name: string;
  address: string | null;
  city: string | null;
  status: string;
  user_id: string;
  image_url: string | null;
  created_at: string | null;
}

export interface CreateHeadquarterData {
  name: string;
  address?: string | null;
  city?: string | null;
  status?: string;
  image_url?: string | null;
  user_id: string;
}

export interface UpdateHeadquarterData {
  name?: string;
  address?: string | null;
  city?: string | null;
  status?: string;
  image_url?: string | null;
  user_id?: string;
}

export interface HeadquarterWithStats extends Headquarter {
  beneficiary_count?: number;
  project_count?: number;
  // Aliases para compatibilidad con componentes existentes
  id?: number;
  players?: number;
  capacity?: number;
  utilization?: number;
  coordinates?: string;
}
