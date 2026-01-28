/**
 * Gallery Items table types
 */

export interface GalleryItemsRow {
  bucket_path: string
  category: string
  created_at: string | null
  description: string | null
  display_order: number | null
  gallery_item_id: string
  is_active: boolean | null
  thumbnail_path: string | null
  title: string
  type: string
  updated_at: string | null
  uploaded_by: string | null
  video_url: string | null
}

export interface GalleryItemsInsert {
  bucket_path: string
  category: string
  created_at?: string | null
  description?: string | null
  display_order?: number | null
  gallery_item_id?: string
  is_active?: boolean | null
  thumbnail_path?: string | null
  title: string
  type: string
  updated_at?: string | null
  uploaded_by?: string | null
  video_url?: string | null
}

export interface GalleryItemsUpdate {
  bucket_path?: string
  category?: string
  created_at?: string | null
  description?: string | null
  display_order?: number | null
  gallery_item_id?: string
  is_active?: boolean | null
  thumbnail_path?: string | null
  title?: string
  type?: string
  updated_at?: string | null
  uploaded_by?: string | null
  video_url?: string | null
}
