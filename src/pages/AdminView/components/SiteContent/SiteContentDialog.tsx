import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/common/ImageUpload';
import type { SiteContent, SiteContentFormData } from '@/types';

interface SiteContentDialogProps {
  showDialog: boolean;
  setShowDialog: (value: boolean) => void;
  isCreating: boolean;
  editingContent: SiteContent | null;
  formData: SiteContentFormData;
  setFormData: (value: SiteContentFormData) => void;
  file: File | null;
  previewUrl: string | null;
  handleImageChange: (file: File | null, preview: string | null) => void;
  handleSubmit: () => void;
  getPageSectionLabel: (section: string) => string;
}

export const SiteContentDialog = ({
  showDialog,
  setShowDialog,
  isCreating,
  editingContent,
  formData,
  setFormData,
  file,
  previewUrl,
  handleImageChange,
  handleSubmit,
  getPageSectionLabel,
}: SiteContentDialogProps) => {
  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isCreating ? 'Nuevo Contenido' : 'Cambiar Imagen'}</DialogTitle>
          <DialogDescription>
            {isCreating 
              ? 'Crea un nuevo contenido para las páginas públicas'
              : `Actualiza la imagen de ${editingContent?.title}`
            }
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {isCreating ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="content_key">Clave de Contenido *</Label>
                <Input
                  id="content_key"
                  value={formData.content_key}
                  onChange={(e) => setFormData({ ...formData, content_key: e.target.value })}
                  placeholder="home_hero, home_impact, etc."
                />
                <p className="text-xs text-muted-foreground">
                  Identificador único (ej: home_hero, home_transformation_1)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Hero Principal"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del contenido"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="page_section">Sección *</Label>
                  <select
                    id="page_section"
                    value={formData.page_section}
                    onChange={(e) => setFormData({ ...formData, page_section: e.target.value as 'home' | 'about' | 'contact' | 'donation' | 'gallery' | 'projects' })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="home">Inicio</option>
                    <option value="about">Quiénes Somos</option>
                    <option value="contact">Contacto</option>
                    <option value="donation">Donaciones</option>
                    <option value="gallery">Galería</option>
                    <option value="projects">Proyectos</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content_type">Tipo</Label>
                  <select
                    id="content_type"
                    value={formData.content_type}
                    onChange={(e) => setFormData({ ...formData, content_type: e.target.value as 'image' | 'video' })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="image">Foto</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="hero, banner, card, etc."
                />
              </div>

              {formData.content_type === 'video' && (
                <div className="space-y-2">
                  <Label htmlFor="video_url">URL del Video</Label>
                  <Input
                    id="video_url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              )}
            </>
          ) : (
            <div className="space-y-2">
              <Label>Información</Label>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Sección:</span>{' '}
                  {editingContent && getPageSectionLabel(editingContent.page_section)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Clave:</span>{' '}
                  <code className="bg-background px-2 py-1 rounded">
                    {editingContent?.content_key}
                  </code>
                </p>
              </div>
            </div>
          )}

          <ImageUpload
            value={previewUrl}
            onChange={handleImageChange}
            label={isCreating ? "Imagen *" : "Nueva Imagen"}
            description={isCreating 
              ? "Selecciona la imagen del contenido" 
              : "Selecciona una imagen para reemplazar la actual"
            }
            aspectRatio="auto"
            maxSizeMB={5}
          />

          {!isCreating && editingContent?.description && (
            <div className="space-y-2">
              <Label>Descripción</Label>
              <p className="text-sm text-muted-foreground">
                {editingContent.description}
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!file}>
            <Upload className="w-4 h-4 mr-2" />
            {isCreating ? 'Crear Contenido' : 'Actualizar Imagen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
