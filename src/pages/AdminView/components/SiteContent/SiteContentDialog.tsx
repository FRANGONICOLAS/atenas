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
