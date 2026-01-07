import { Upload, X, ImageIcon, Video, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ContentForm {
  type: 'image' | 'video' | 'text';
  section: 'gallery' | 'testimonials' | 'about' | 'projects';
  title: string;
  url: string;
  description: string;
}

interface ContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentForm: ContentForm;
  onContentFormChange: (form: ContentForm) => void;
  onUpload: () => void;
}

export const ContentDialog = ({
  open,
  onOpenChange,
  contentForm,
  onContentFormChange,
  onUpload,
}: ContentDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Gestión de Contenido Multimedia
          </DialogTitle>
          <DialogDescription>
            Sube y administra imágenes, videos y contenido textual del sitio web
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contentType">Tipo de Contenido *</Label>
              <Select
                value={contentForm.type}
                onValueChange={(value: 'image' | 'video' | 'text') =>
                  onContentFormChange({ ...contentForm, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Imagen
                    </div>
                  </SelectItem>
                  <SelectItem value="video">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Video
                    </div>
                  </SelectItem>
                  <SelectItem value="text">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Texto
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="section">Sección *</Label>
              <Select
                value={contentForm.section}
                onValueChange={(value: 'gallery' | 'testimonials' | 'about' | 'projects') =>
                  onContentFormChange({ ...contentForm, section: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gallery">Galería</SelectItem>
                  <SelectItem value="testimonials">Testimonios</SelectItem>
                  <SelectItem value="about">Quiénes Somos</SelectItem>
                  <SelectItem value="projects">Proyectos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={contentForm.title}
              onChange={(e) => onContentFormChange({ ...contentForm, title: e.target.value })}
              placeholder="Título descriptivo del contenido"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL/Archivo *</Label>
            <div className="flex gap-2">
              <Input
                id="url"
                value={contentForm.url}
                onChange={(e) => onContentFormChange({ ...contentForm, url: e.target.value })}
                placeholder="https://example.com/image.jpg o subir archivo"
              />
              <Button variant="outline" size="icon">
                <Upload className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={contentForm.description}
              onChange={(e) => onContentFormChange({ ...contentForm, description: e.target.value })}
              placeholder="Describe el contenido (opcional)"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={onUpload}>
            <Upload className="w-4 h-4 mr-2" />
            Subir Contenido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
