export type GalleryItemType = "photo" | "video";

export type GalleryCategory =
  | "Entrenamiento"
  | "Torneos"
  | "Highlights"
  | "Momentos"
  | "Instalaciones"
  | "Jugadores"
  | "Educación"
  | "Bienestar"
  | "Documentales"
  | "Otros";

export interface GalleryItem {
  gallery_item_id: string;
  title: string;
  description?: string;
  category: GalleryCategory;
  type: GalleryItemType;
  bucket_path: string;
  thumbnail_path?: string;
  video_url?: string;
  is_active: boolean;
  display_order: number;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
  public_url?: string;
}

export interface CreateGalleryItemDto {
  title: string;
  description?: string;
  category: GalleryCategory;
  type: GalleryItemType;
  file: File;
  video_url?: string;
  display_order?: number;
}

export interface UpdateGalleryItemDto {
  title?: string;
  description?: string;
  category?: GalleryCategory;
  is_active?: boolean;
  display_order?: number;
  video_url?: string;
}

export interface GalleryStats {
  total: number;
  active: number;
  photos: number;
  videos: number;
}
