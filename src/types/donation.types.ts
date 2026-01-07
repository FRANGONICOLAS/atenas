export type DonationStatus = 'completed' | 'pending' | 'processing' | 'cancelled';
export type DonationType = 'monetary' | 'equipment' | 'infrastructure' | 'sponsorship';
export type PaymentMethod = 'transfer' | 'card' | 'cash' | 'check';

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

export interface DonationStats {
  totalDonated: number;
  projectsSupported: number;
  beneficiariesImpacted: number;
  lastDonation: string;
}
