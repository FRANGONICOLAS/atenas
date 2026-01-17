export type HeadquarterStatus = 'active' | 'inactive' | 'maintenance';

export interface Headquarter {
  headquarters_id: string;
  name: string;
  address: string | null;
  city: string | null;
  status: string;
  user_id: string;
  created_at: string | null;
}

export interface CreateHeadquarterData {
  name: string;
  address?: string | null;
  city?: string | null;
  status?: string;
  user_id: string;
}

export interface UpdateHeadquarterData {
  name?: string;
  address?: string | null;
  city?: string | null;
  status?: string;
  user_id?: string;
}

export interface HeadquarterWithStats extends Headquarter {
  beneficiary_count?: number;
  project_count?: number;
}
