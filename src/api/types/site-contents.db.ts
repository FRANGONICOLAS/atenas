/**
 * Site Contents table types
 */

import type { Json } from './base.db'

export interface SiteContentsRow {
  bucket_path: string
  category: string | null
  content_id: string
  content_key: string
  content_type: string
  created_at: string | null
  description: string | null
  display_order: number | null
  is_active: boolean | null
  metadata: Json | null
  page_section: string
  thumbnail_path: string | null
  title: string
  updated_at: string | null
  uploaded_by: string | null
  video_url: string | null
}

export interface SiteContentsInsert {
  bucket_path: string
  category?: string | null
  content_id?: string
  content_key: string
  content_type: string
  created_at?: string | null
  description?: string | null
  display_order?: number | null
  is_active?: boolean | null
  metadata?: Json | null
  page_section: string
  thumbnail_path?: string | null
  title: string
  updated_at?: string | null
  uploaded_by?: string | null
  video_url?: string | null
}

export interface SiteContentsUpdate {
  bucket_path?: string
  category?: string | null
  content_id?: string
  content_key?: string
  content_type?: string
  created_at?: string | null
  description?: string | null
  display_order?: number | null
  is_active?: boolean | null
  metadata?: Json | null
  page_section?: string
  thumbnail_path?: string | null
  title?: string
  updated_at?: string | null
  uploaded_by?: string | null
  video_url?: string | null
}
