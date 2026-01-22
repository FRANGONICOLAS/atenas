export type DonationStatus = 'completed' | 'pending' | 'processing' | 'cancelled' | 'approved';
export type DonationType = 'monetary' | 'equipment' | 'infrastructure' | 'sponsorship';
export type PaymentMethod = 'transfer' | 'card' | 'cash' | 'check' | 'pay_pal' | 'bold';

export interface Donation {
  id: number;
  donorName: string;
  amount: number;
  type: DonationType;
  status: DonationStatus;
  date: string;
  paymentMethod: PaymentMethod;
  reference?: string;
  project?: string;
  description: string;
  receiptNumber?: string;
}

// Tipos para donaciones de la base de datos
export interface DonationFromDB {
  donation_id: string;
  user_id: string;
  project_id: string;
  currency: string;
  amount: string;
  status: string;
  date: string;
  pay_method: string;
  approve_code: string;
  created_at: string;
}

export interface DonationWithProject extends DonationFromDB {
  project?: {
    project_id: string;
    name: string;
    category: string;
    finance_goal: string | number;
  };
}

export interface DonationStats {
  totalDonated: number;
  projectsSupported: number;
  beneficiariesImpacted: number;
  recentDonations: DonationWithProject[];
  supportedProjects: Array<{
    project_id: string;
    project_name: string;
    category: string;
    totalDonated: number;
    progress: number;
    finance_goal: number;
  }>;
}
