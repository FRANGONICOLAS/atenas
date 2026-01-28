/**
 * Donation table types
 */

export interface DonationRow {
  amount: number
  approve_code: string | null
  created_at: string | null
  currency: string
  date: string
  donation_id: string
  pay_method: string | null
  project_id: string
  status: string
  user_id: string
}

export interface DonationInsert {
  amount: number
  approve_code?: string | null
  created_at?: string | null
  currency?: string
  date?: string
  donation_id?: string
  pay_method?: string | null
  project_id: string
  status?: string
  user_id: string
}

export interface DonationUpdate {
  amount?: number
  approve_code?: string | null
  created_at?: string | null
  currency?: string
  date?: string
  donation_id?: string
  pay_method?: string | null
  project_id?: string
  status?: string
  user_id?: string
}
