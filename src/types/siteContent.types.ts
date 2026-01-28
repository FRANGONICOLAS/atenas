export type ContentType = "image" | "video";
export type PageSection = "home" | "about" | "contact" | "donation" | "gallery" | "projects";

// Interfaz para contenido del sitio almacenado en la base de datos
export interface SiteContent {
  content_id: string;
  content_key: string;
  title: string;
  description?: string;
  category?: string;
  content_type: ContentType;
  bucket_path: string;
  thumbnail_path?: string;
  video_url?: string;
  page_section: PageSection;
  is_active: boolean;
  display_order: number;
  metadata?: Record<string, unknown>;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
  public_url?: string;
}

// DTO para crear nuevo contenido del sitio
export interface CreateSiteContentDto {
  content_key: string;
  title: string;
  description?: string;
  category?: string;
  content_type: ContentType;
  page_section: PageSection;
  file: File;
  video_url?: string;
  display_order?: number;
}

// DTO para actualizar contenido existente
export interface UpdateSiteContentDto {
  title?: string;
  description?: string;
  is_active?: boolean;
  display_order?: number;
}

// Formulario para crear/editar contenido en el admin
export interface SiteContentFormData {
  content_key: string;
  title: string;
  description: string;
  page_section: PageSection;
  content_type: ContentType;
  category: string;
  video_url: string;
}

// Estadísticas del contenido del sitio
export interface SiteContentStats {
  total: number;
  active: number;
  photos: number;
  videos: number;
  by_section: Record<string, number>;
}
