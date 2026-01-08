export interface Location {
  id: number;
  name: string;
  address: string;
  coordinates: string;
  city: string;
  beneficiaries: number;
  phone: string;
  status: 'active' | 'inactive' | 'maintenance';
}
