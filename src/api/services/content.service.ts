import { client } from "@/api/supabase/client";
import { storageService } from "./storage.service";
import type {
  SiteContent,
  CreateSiteContentDto,
  UpdateSiteContentDto,
  SiteContentStats,
  PageSection,
  ContentType,
} from "@/types";

const BUCKET_NAME = "atenas-gallery";

export const contentService = {
  // Obtiene todos los contenidos activos (público)
  async getActiveContents(): Promise<SiteContent[]> {
    const { data, error } = await client
      .from("site_contents")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;

    // Agregar URLs públicas
    return (data || []).map((item) => ({
      ...item,
      public_url: storageService.getPublicUrl(BUCKET_NAME, item.bucket_path),
    }));
  },

  // Obtiene todos los contenidos (admin)
  async getAllContents(): Promise<SiteContent[]> {
    const { data, error } = await client
      .from("site_contents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Agregar URLs públicas
    return (data || []).map((item) => ({
      ...item,
      public_url: storageService.getPublicUrl(BUCKET_NAME, item.bucket_path),
    }));
  },

  // Obtiene un contenido por su clave (ej: 'home_hero', 'about_banner')
  async getContentByKey(contentKey: string): Promise<SiteContent | null> {
    const { data, error } = await client
      .from("site_contents")
      .select("*")
      .eq("content_key", contentKey)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      public_url: storageService.getPublicUrl(BUCKET_NAME, data.bucket_path),
    };
  },

  // Obtiene contenidos por sección de página
  async getContentsBySection(section: PageSection): Promise<SiteContent[]> {
    const { data, error } = await client
      .from("site_contents")
      .select("*")
      .eq("page_section", section)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;

    return (data || []).map((item) => ({
      ...item,
      public_url: storageService.getPublicUrl(BUCKET_NAME, item.bucket_path),
    }));
  },

  // Crea un nuevo contenido
  async createContent(contentData: CreateSiteContentDto): Promise<SiteContent> {
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const extension = contentData.file.name.split(".").pop();
    const safeName = contentData.file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}-${safeName}`;
    const filePath = `sites-content/${contentData.page_section}/${contentData.content_key}/${fileName}`;

    // Subir archivo al bucket
    await storageService.uploadFile(BUCKET_NAME, filePath, contentData.file, {
      cacheControl: "3600",
      upsert: false,
    });

    // Insertar en la base de datos
    const { data, error } = await client
      .from("site_contents")
      .insert({
        content_key: contentData.content_key,
        title: contentData.title,
        description: contentData.description,
        category: contentData.category,
        content_type: contentData.content_type,
        page_section: contentData.page_section,
        bucket_path: filePath,
        video_url: contentData.video_url || '',
        display_order: contentData.display_order || 0,
        uploaded_by: user.id,
        metadata: {
          filename: contentData.file.name,
          size: contentData.file.size,
          mime_type: contentData.file.type,
        },
      })
      .select()
      .single();

    if (error) {
      // Si falla la inserción, eliminar el archivo subido
      await storageService.deleteFile(BUCKET_NAME, [filePath]).catch(() => {});
      throw error;
    }

    return {
      ...data,
      public_url: storageService.getPublicUrl(BUCKET_NAME, data.bucket_path),
    };
  },

  // Actualiza un contenido existente (solo metadata, no el archivo)
  async updateContent(
    id: string,
    updates: UpdateSiteContentDto
  ): Promise<SiteContent> {
    const { data, error } = await client
      .from("site_contents")
      .update(updates)
      .eq("content_id", id)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      public_url: storageService.getPublicUrl(BUCKET_NAME, data.bucket_path),
    };
  },

  // Actualiza el archivo de un contenido existente (reemplaza la imagen)
  async updateContentFile(
    contentKey: string,
    newFile: File
  ): Promise<SiteContent> {
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    // Primero obtener el contenido actual
    const { data: currentContent, error: fetchError } = await client
      .from("site_contents")
      .select("*")
      .eq("content_key", contentKey)
      .single();

    if (fetchError) throw fetchError;

    // Generar nuevo nombre para el archivo
    const timestamp = Date.now();
    const safeName = newFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}-${safeName}`;
    const newFilePath = `sites-content/${currentContent.page_section}/${contentKey}/${fileName}`;

    // Subir el nuevo archivo
    await storageService.uploadFile(BUCKET_NAME, newFilePath, newFile, {
      cacheControl: "3600",
      upsert: false,
    });

    // Actualizar la base de datos con la nueva ruta
    const { data, error } = await client
      .from("site_contents")
      .update({
        bucket_path: newFilePath,
        metadata: {
          filename: newFile.name,
          size: newFile.size,
          mime_type: newFile.type,
        },
        uploaded_by: user.id,
      })
      .eq("content_key", contentKey)
      .select()
      .single();

    if (error) {
      // Si falla la actualización, eliminar el nuevo archivo
      await storageService.deleteFile(BUCKET_NAME, [newFilePath]).catch(() => {});
      throw error;
    }

    // Eliminar el archivo anterior
    if (currentContent.bucket_path !== newFilePath) {
      await storageService
        .deleteFile(BUCKET_NAME, [currentContent.bucket_path])
        .catch(() => {});
    }

    return {
      ...data,
      public_url: storageService.getPublicUrl(BUCKET_NAME, data.bucket_path),
    };
  },

  // Elimina un contenido (y su archivo del storage)
  async deleteContent(id: string): Promise<void> {
    // Primero obtener el contenido para saber qué archivo eliminar
    const { data: content, error: fetchError } = await client
      .from("site_contents")
      .select("bucket_path")
      .eq("content_id", id)
      .single();

    if (fetchError) throw fetchError;

    // Eliminar archivo del storage
    await storageService.deleteFile(BUCKET_NAME, [content.bucket_path]);

    // Eliminar registro de la base de datos
    const { error: deleteError } = await client
      .from("site_contents")
      .delete()
      .eq("content_id", id);

    if (deleteError) throw deleteError;
  },

  // Cambia el estado activo/inactivo de un contenido
  async toggleActive(id: string, isActive: boolean): Promise<SiteContent> {
    return this.updateContent(id, { is_active: isActive });
  },

  // Reordena contenidos
  async reorderContents(
    items: Array<{ id: string; order: number }>
  ): Promise<void> {
    const updates = items.map((item) =>
      client
        .from("site_contents")
        .update({ display_order: item.order })
        .eq("content_id", item.id)
    );

    await Promise.all(updates);
  },

  // Obtiene las estadísticas del contenido
  async getStats(): Promise<SiteContentStats> {
    const { data, error } = await client
      .from("site_contents")
      .select("content_type, is_active, page_section");

    if (error) throw error;

    const stats: SiteContentStats = {
      total: data.length,
      active: data.filter((item) => item.is_active).length,
      photos: data.filter((item) => item.content_type === "image").length,
      videos: data.filter((item) => item.content_type === "video").length,
      by_section: {},
    };

    // Contar por sección
    data.forEach((item) => {
      stats.by_section[item.page_section] =
        (stats.by_section[item.page_section] || 0) + 1;
    });

    return stats;
  },
};
