export type BeneficiaryStatus = 'active' | 'pending' | 'inactive';

export interface Beneficiary {
  id: number;
  name: string;
  age: number;
  category: string;
  location: string;
  status: BeneficiaryStatus;
  performance: number;
  attendance: number;
  birthDate: string;
  joinDate: string;
  guardian: string;
  phone: string;
  address: string;
  emergencyContact: string;
  medicalInfo: string;
  achievements?: Achievement[];
}

export interface Achievement {
  date: string;
  title: string;
  description: string;
}

export interface BeneficiaryReport {
  id: number;
  name: string;
  age: number;
  category: string;
  location: string;
  status: string;
  performance?: number;
  attendance?: number;
}
