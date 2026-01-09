export type UserRole = 'admin' | 'director' | 'director_sede' | 'donator' | 'beneficiary';
export type UserStatus = 'active' | 'inactive' | 'pending';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt?: string;
  phone?: string;
  avatar?: string;
}

export interface UserReport {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  date: string;
}
