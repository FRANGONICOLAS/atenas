/**
 * Bold Transactions table types
 */

import type { Json } from './base.db'

export interface BoldTransactionsRow {
  amount: number
  bold_transaction_id: string
  created_at: string | null
  currency: string
  description: string | null
  donation_id: string | null
  integrity_signature: string | null
  order_id: string
  payment_method: string | null
  project_id: string | null
  status: string
  transaction_id: string | null
  updated_at: string | null
  user_id: string
  webhook_payload: Json | null
}

export interface BoldTransactionsInsert {
  amount: number
  bold_transaction_id?: string
  created_at?: string | null
  currency?: string
  description?: string | null
  donation_id?: string | null
  integrity_signature?: string | null
  order_id: string
  payment_method?: string | null
  project_id?: string | null
  status?: string
  transaction_id?: string | null
  updated_at?: string | null
  user_id: string
  webhook_payload?: Json | null
}

export interface BoldTransactionsUpdate {
  amount?: number
  bold_transaction_id?: string
  created_at?: string | null
  currency?: string
  description?: string | null
  donation_id?: string | null
  integrity_signature?: string | null
  order_id?: string
  payment_method?: string | null
  project_id?: string | null
  status?: string
  transaction_id?: string | null
  updated_at?: string | null
  user_id?: string
  webhook_payload?: Json | null
}
