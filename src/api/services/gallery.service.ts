import { client } from "@/api/supabase/client";
import { storageService } from "./storage.service";
import type {
  GalleryItem,
  GalleryCategory,
  GalleryItemType,
  CreateGalleryItemDto,
  UpdateGalleryItemDto,
} from "@/types/gallery.types";

const BUCKET_NAME = "atenas-gallery";

/**
 * Servicio para gestionar elementos de la galería
 */
export const galleryService = {
  /**
   * Obtiene todos los elementos activos de la galería (público)
   */
  async getActiveItems(): Promise<GalleryItem[]> {
    const { data, error } = await client
      .from("gallery_items")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Agregar URLs públicas
    return (data || []).map((item) => ({
      ...item,
      public_url: storageService.getPublicUrl(BUCKET_NAME, item.bucket_path),
    }));
  },

  /**
   * Obtiene todos los elementos (admin)
   */
  async getAllItems(): Promise<GalleryItem[]> {
    const { data, error } = await client
      .from("gallery_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Agregar URLs públicas
    return (data || []).map((item) => ({
      ...item,
      public_url: storageService.getPublicUrl(BUCKET_NAME, item.bucket_path),
    }));
  },

  /**
   * Obtiene elementos filtrados por categoría
   */
  async getItemsByCategory(category: GalleryCategory): Promise<GalleryItem[]> {
    const { data, error } = await client
      .from("gallery_items")
      .select("*")
      .eq("category", category)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;

    return (data || []).map((item) => ({
      ...item,
      public_url: storageService.getPublicUrl(BUCKET_NAME, item.bucket_path),
    }));
  },

  /**
   * Obtiene elementos filtrados por tipo
   */
  async getItemsByType(type: GalleryItemType): Promise<GalleryItem[]> {
    const { data, error } = await client
      .from("gallery_items")
      .select("*")
      .eq("type", type)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;

    return (data || []).map((item) => ({
      ...item,
      public_url: storageService.getPublicUrl(BUCKET_NAME, item.bucket_path),
    }));
  },

  /**
   * Crea un nuevo elemento en la galería
   */
  async createItem(itemData: CreateGalleryItemDto): Promise<GalleryItem> {
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const extension = itemData.file.name.split(".").pop();
    const fileName = `${timestamp}-${itemData.file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = `${itemData.type}s/${fileName}`;

    // Subir archivo al bucket
    await storageService.uploadFile(BUCKET_NAME, filePath, itemData.file, {
      cacheControl: "3600",
      upsert: false,
    });

    // Insertar en la base de datos
    const { data, error } = await client
      .from("gallery_items")
      .insert({
        title: itemData.title,
        description: itemData.description,
        category: itemData.category,
        type: itemData.type,
        bucket_path: filePath,
        video_url: itemData.video_url,
        display_order: itemData.display_order || 0,
        uploaded_by: user.id,
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

  /**
   * Actualiza un elemento existente
   */
  async updateItem(
    id: string,
    updates: UpdateGalleryItemDto
  ): Promise<GalleryItem> {
    const { data, error } = await client
      .from("gallery_items")
      .update(updates)
      .eq("gallery_item_id", id)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      public_url: storageService.getPublicUrl(BUCKET_NAME, data.bucket_path),
    };
  },

  /**
   * Elimina un elemento (y su archivo del storage)
   */
  async deleteItem(id: string): Promise<void> {
    // Primero obtener el elemento para saber qué archivo eliminar
    const { data: item, error: fetchError } = await client
      .from("gallery_items")
      .select("bucket_path")
      .eq("gallery_item_id", id)
      .single();

    if (fetchError) throw fetchError;

    // Eliminar archivo del storage
    await storageService.deleteFile(BUCKET_NAME, [item.bucket_path]);

    // Eliminar registro de la base de datos
    const { error: deleteError } = await client
      .from("gallery_items")
      .delete()
      .eq("gallery_item_id", id);

    if (deleteError) throw deleteError;
  },

  /**
   * Cambia el estado activo/inactivo de un elemento
   */
  async toggleActive(id: string, isActive: boolean): Promise<GalleryItem> {
    return this.updateItem(id, { is_active: isActive });
  },

  /**
   * Reordena elementos
   */
  async reorderItems(items: Array<{ id: string; order: number }>): Promise<void> {
    const updates = items.map((item) =>
      client
        .from("gallery_items")
        .update({ display_order: item.order })
        .eq("gallery_item_id", item.id)
    );

    await Promise.all(updates);
  },

  /**
   * Obtiene las estadísticas de la galería
   */
  async getStats() {
    const { data, error } = await client
      .from("gallery_items")
      .select("type, is_active");

    if (error) throw error;

    const stats = {
      total: data.length,
      active: data.filter((item) => item.is_active).length,
      photos: data.filter((item) => item.type === "photo").length,
      videos: data.filter((item) => item.type === "video").length,
    };

    return stats;
  },
};
