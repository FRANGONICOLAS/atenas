import { client } from "@/api/supabase/client";

/**
 * Servicio para operaciones con Supabase Storage
 * Maneja la subida, descarga y eliminación de archivos
 */
export const storageService = {
  /**
   * Sube un archivo a un bucket específico
   */
  async uploadFile(
    bucket: string,
    path: string,
    file: File,
    options?: {
      cacheControl?: string;
      contentType?: string;
      upsert?: boolean;
    }
  ) {
    const { data, error } = await client.storage
      .from(bucket)
      .upload(path, file, options);
    if (error) throw error;
    return data;
  },

  /**
   * Obtiene la URL pública de un archivo
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = client.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Elimina un archivo del storage
   */
  async deleteFile(bucket: string, paths: string[]) {
    const { data, error } = await client.storage.from(bucket).remove(paths);
    if (error) throw error;
    return data;
  },

  /**
   * Lista archivos en un bucket
   */
  async listFiles(bucket: string, path?: string) {
    const { data, error } = await client.storage.from(bucket).list(path);
    if (error) throw error;
    return data;
  },

  /**
   * Descarga un archivo
   */
  async downloadFile(bucket: string, path: string) {
    const { data, error } = await client.storage.from(bucket).download(path);
    if (error) throw error;
    return data;
  },

  /**
   * Actualiza un archivo existente (elimina el anterior y sube uno nuevo)
   */
  async updateFile(
    bucket: string,
    oldPath: string,
    newFile: File,
    newPath?: string
  ) {
    // Eliminar archivo anterior
    await this.deleteFile(bucket, [oldPath]);

    // Subir nuevo archivo
    const finalPath = newPath || oldPath;
    return await this.uploadFile(bucket, finalPath, newFile, { upsert: true });
  },

  /**
   * Crea un bucket
   */
  async createBucket(bucketName: string, options?: { public: boolean }) {
    const { data, error } = await client.storage.createBucket(
      bucketName,
      options
    );
    if (error) throw error;
    return data;
  },

  /**
   * Elimina un bucket
   */
  async deleteBucket(bucketName: string) {
    const { data, error } = await client.storage.deleteBucket(bucketName);
    if (error) throw error;
    return data;
  },
};
