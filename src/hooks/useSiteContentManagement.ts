import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { contentService } from '@/api/services';
import type { SiteContent, SiteContentFormData, PageSection } from '@/types';

export const useSiteContentManagement = () => {
  const [contents, setContents] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [activePageTab, setActivePageTab] = useState<string>('home');
  const [editingContent, setEditingContent] = useState<SiteContent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SiteContent | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    photos: 0,
    videos: 0,
    by_section: {} as Record<string, number>
  });

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<SiteContentFormData>({
    content_key: '',
    title: '',
    description: '',
    page_section: 'home',
    content_type: 'image',
    category: '',
    video_url: '',
  });

  useEffect(() => {
    loadContents();
    loadStats();
  }, []);

  const loadContents = async () => {
    try {
      setLoading(true);
      const data = await contentService.getAllContents();
      setContents(data);
    } catch (error) {
      toast.error('Error al cargar contenidos', {
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await contentService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleOpenEdit = (content: SiteContent) => {
    setEditingContent(content);
    setIsCreating(false);
    setFile(null);
    setPreviewUrl(content.public_url || null);
    setShowDialog(true);
  };

  const handleOpenCreate = () => {
    setEditingContent(null);
    setIsCreating(true);
    setFile(null);
    setPreviewUrl(null);
    setFormData({
      content_key: '',
      title: '',
      description: '',
      page_section: 'home',
      content_type: 'image',
      category: '',
      video_url: '',
    });
    setShowDialog(true);
  };

  const handleImageChange = (newFile: File | null, newPreview: string | null) => {
    setFile(newFile);
    setPreviewUrl(newPreview);
  };

  const handleSubmit = async () => {
    try {
      if (isCreating) {
        if (!file) {
          toast.error('Debes seleccionar una imagen');
          return;
        }
        if (!formData.content_key || !formData.title || !formData.page_section) {
          toast.error('Completa todos los campos requeridos');
          return;
        }

        await contentService.createContent({
          content_key: formData.content_key,
          title: formData.title,
          description: formData.description || undefined,
          page_section: formData.page_section,
          content_type: formData.content_type,
          category: formData.category || undefined,
          video_url: formData.video_url || undefined,
          file: file,
        });

        toast.success('Contenido creado correctamente');
      } else if (editingContent) {
        if (file) {
          await contentService.updateContentFile(editingContent.content_key, file);
          toast.success('Imagen actualizada correctamente');
        } else {
          toast.info('No se seleccionó ninguna imagen nueva');
        }
      }

      setShowDialog(false);
      loadContents();
      loadStats();
    } catch (error) {
      toast.error(isCreating ? 'Error al crear' : 'Error al actualizar', {
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await contentService.deleteContent(id);
      toast.success('Contenido eliminado correctamente');
      setDeleteTarget(null);
      loadContents();
      loadStats();
    } catch (error) {
      toast.error('Error al eliminar', {
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  const handleToggleActive = async (content: SiteContent) => {
    try {
      await contentService.toggleActive(content.content_id, !content.is_active);
      toast.success(content.is_active ? 'Contenido desactivado' : 'Contenido activado');
      loadContents();
      loadStats();
    } catch (error) {
      toast.error('Error al cambiar estado', {
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  const getPageSectionLabel = (section: string) => {
    const labels: Record<string, string> = {
      home: 'Inicio',
      about: 'Quiénes Somos',
      contact: 'Contacto',
      donation: 'Donaciones',
      gallery: 'Galería',
      projects: 'Proyectos',
    };
    return labels[section] || section;
  };

  return {
    contents,
    loading,
    showDialog,
    setShowDialog,
    activePageTab,
    setActivePageTab,
    editingContent,
    setEditingContent,
    deleteTarget,
    setDeleteTarget,
    stats,
    file,
    setFile,
    previewUrl,
    setPreviewUrl,
    isCreating,
    setIsCreating,
    formData,
    setFormData,
    handleOpenEdit,
    handleOpenCreate,
    handleImageChange,
    handleSubmit,
    handleDelete,
    handleToggleActive,
    getPageSectionLabel,
  };
};
