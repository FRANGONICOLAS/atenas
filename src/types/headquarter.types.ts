export type HeadquarterStatus = 'active' | 'inactive' | 'maintenance';

export interface Headquarter {
  id: number;
  name: string;
  players: number;
  capacity: number;
  utilization: number;
  status: HeadquarterStatus;
  address: string;
  coordinates: string;
}
