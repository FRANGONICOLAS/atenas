import { useState, useEffect } from 'react';
import { Upload, Download, FileText, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FullScreenLoader } from '@/components/common/FullScreenLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { galleryService } from '@/api/services';
import type { GalleryItem, GalleryCategory, GalleryItemType } from '@/types';
import DeleteConfirmation from '@/components/modals/DeleteConfirmation';

interface GalleryFormData {
  title: string;
  description: string;
  category: GalleryCategory;
  type: GalleryItemType;
  file: File | null;
  video_url: string;
}

const ContentPage = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [stats, setStats] = useState({ total: 0, active: 0, photos: 0, videos: 0 });
  
  const [formData, setFormData] = useState<GalleryFormData>({
    title: '',
    description: '',
    category: 'Otros',
    type: 'photo',
    file: null,
    video_url: '',
  });

  useEffect(() => {
    loadItems();
    loadStats();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await galleryService.getAllItems();
      setItems(data);
    } catch (error) {
      toast.error('Error al cargar elementos', {
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await galleryService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      category: 'Otros',
      type: 'photo',
      file: null,
      video_url: '',
    });
    setShowDialog(true);
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      category: item.category,
      type: item.type,
      file: null,
      video_url: item.video_url || '',
    });
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingItem) {
        // Actualizar
        await galleryService.updateItem(editingItem.gallery_item_id, {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          video_url: formData.video_url,
        });
        toast.success('Elemento actualizado correctamente');
      } else {
        // Crear
        if (!formData.file) {
          toast.error('Debes seleccionar un archivo');
          return;
        }
        await galleryService.createItem({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          type: formData.type,
          file: formData.file,
          video_url: formData.video_url,
        });
        toast.success('Elemento creado correctamente');
      }
      setShowDialog(false);
      loadItems();
      loadStats();
    } catch (error) {
      toast.error('Error al guardar', {
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await galleryService.deleteItem(id);
      toast.success('Elemento eliminado correctamente');
      setDeleteTarget(null);
      loadItems();
      loadStats();
    } catch (error) {
      toast.error('Error al eliminar', {
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  const handleToggleActive = async (item: GalleryItem) => {
    try {
      await galleryService.toggleActive(item.gallery_item_id, !item.is_active);
      toast.success(item.is_active ? 'Elemento desactivado' : 'Elemento activado');
      loadItems();
      loadStats();
    } catch (error) {
      toast.error('Error al cambiar estado', {
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, file });
    }
  };

  if (loading) {
    return <FullScreenLoader message="Cargando galería..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Galería</h2>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleOpenCreate}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Subir Contenido
          </Button>
        </div>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-foreground mb-1">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total de Elementos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600 mb-1">{stats.active}</div>
            <p className="text-sm text-muted-foreground">Elementos Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-foreground mb-1">{stats.photos}</div>
            <p className="text-sm text-muted-foreground">Fotos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-foreground mb-1">{stats.videos}</div>
            <p className="text-sm text-muted-foreground">Videos</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Content Table */}
        <Card>
          <CardHeader>
            <CardTitle>Elementos de la Galería</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Cargando...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vista Previa</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No hay elementos en la galería
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.gallery_item_id}>
                        <TableCell>
                          <img 
                            src={item.public_url} 
                            alt={item.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {item.type === 'photo' ? 'Foto' : 'Video'}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          <Badge variant={item.is_active ? 'default' : 'secondary'}>
                            {item.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString('es-CO')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => handleToggleActive(item)}
                            >
                              {item.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => handleOpenEdit(item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => setDeleteTarget(item)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Elemento' : 'Nuevo Elemento'}
            </DialogTitle>
            <DialogDescription>
              {editingItem 
                ? 'Actualiza la información del elemento de la galería' 
                : 'Sube un nuevo elemento a la galería pública'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: GalleryItemType) =>
                    setFormData({ ...formData, type: value })
                  }
                  disabled={!!editingItem}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="photo">Foto</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: GalleryCategory) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Entrenamiento">Entrenamiento</SelectItem>
                    <SelectItem value="Torneos">Torneos</SelectItem>
                    <SelectItem value="Highlights">Highlights</SelectItem>
                    <SelectItem value="Momentos">Momentos</SelectItem>
                    <SelectItem value="Instalaciones">Instalaciones</SelectItem>
                    <SelectItem value="Jugadores">Jugadores</SelectItem>
                    <SelectItem value="Educación">Educación</SelectItem>
                    <SelectItem value="Bienestar">Bienestar</SelectItem>
                    <SelectItem value="Documentales">Documentales</SelectItem>
                    <SelectItem value="Otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título descriptivo del contenido"
              />
            </div>

            {!editingItem && (
              <div className="space-y-2">
                <Label htmlFor="file">Archivo *</Label>
                <Input
                  id="file"
                  type="file"
                  accept={formData.type === 'photo' ? 'image/*' : 'video/*'}
                  onChange={handleFileChange}
                />
                {formData.file && (
                  <p className="text-sm text-muted-foreground">
                    Archivo seleccionado: {formData.file.name}
                  </p>
                )}
              </div>
            )}

            {formData.type === 'video' && (
              <div className="space-y-2">
                <Label htmlFor="video_url">URL del Video (opcional)</Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción opcional del contenido"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingItem ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmation
        open={!!deleteTarget}
        targetName={deleteTarget?.title}
        description="Esta acción no se puede deshacer. Se eliminará el elemento de la galería y su archivo del almacenamiento."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.gallery_item_id)}
      />
    </div>
  );
};

export default ContentPage;
