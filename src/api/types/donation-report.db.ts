/**
 * Donation Report table types
 */

export interface DonationReportRow {
  donation_report_id: string
  generated_at: string | null
  project_id: string
}

export interface DonationReportInsert {
  donation_report_id?: string
  generated_at?: string | null
  project_id: string
}

export interface DonationReportUpdate {
  donation_report_id?: string
  generated_at?: string | null
  project_id?: string
}
