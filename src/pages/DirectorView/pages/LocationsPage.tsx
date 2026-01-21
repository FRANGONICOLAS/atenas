import { MapPin, Plus, Pencil, Trash2, Eye, Users, MapPinned, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FullScreenLoader } from '@/components/common/FullScreenLoader';
import { MapDialog } from '../components';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { Headquarter } from '@/types';
import { useHeadquarters } from '@/hooks/useHeadquarters';
import { ImageUpload } from '@/components/common/ImageUpload';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DeleteConfirmation from '@/components/modals/DeleteConfirmation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { headquarterService } from '@/api/services';
import type { Project } from '@/types/project.types';

const LocationsPage = () => {
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Headquarter | null>(null);
  const [locationProjects, setLocationProjects] = useState<Project[]>([]);
  const [beneficiaryCount, setBeneficiaryCount] = useState(0);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  const {
    headquarters,
    loading,
    showDialog,
    editing,
    form,
    deleteTarget,
    setShowDialog,
    setForm,
    setDeleteTarget,
    setImageFile,
    openCreate,
    openEdit,
    handleSave,
    handleDelete,
  } = useHeadquarters();

  const handleLocationClick = (locationId: string) => {
    const location = headquarters.find((loc) => loc.headquarters_id === locationId);
    if (location) {
      toast.info(`Información de ${location.name}`, {
        description: `${location.address || 'Sin dirección'} - ${location.city || ''}`,
      });
    }
  };

  const handleViewMap = () => {
    setShowMapDialog(true);
  };

  const handleViewDetail = async (location: Headquarter) => {
    setSelectedLocation(location);
    setShowDetailDialog(true);
    setLoadingDetails(true);

    try {
      // Cargar conteo de beneficiarios
      const count = await headquarterService.getBeneficiaryCount(location.headquarters_id);
      setBeneficiaryCount(count);

      // Cargar proyectos asociados
      const projectsData = await headquarterService.getProjects(location.headquarters_id);
      setLocationProjects(projectsData.map(p => p.project));
    } catch (error) {
      console.error('Error loading location details:', error);
      toast.error('Error al cargar los detalles de la sede');
    } finally {
      setLoadingDetails(false);
    }
  };

  if (loading) {
    return <FullScreenLoader message="Cargando sedes..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Sedes</h2>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Nueva Sede
        </Button>
      </div>

      {/* Locations Grid */}
      {headquarters.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No hay sedes registradas</p>
            <Button className="mt-4" onClick={openCreate}>
              Crear primera sede
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {headquarters.map((location) => (
            <Card 
              key={location.headquarters_id} 
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              {location.image_url && (
                <div className="h-40 overflow-hidden bg-gray-100">
                  <img
                    src={location.image_url}
                    alt={location.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{location.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {location.address || 'Sin dirección'}
                    </p>
                    {location.city && (
                      <p className="text-sm text-muted-foreground">{location.city}</p>
                    )}
                  </div>
                  <Badge variant={location.status === 'active' ? 'default' : 'secondary'}>
                    {location.status === 'active' ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>

                <Separator className="my-3" />

                <div className="space-y-2">
                  <Button
                    size="default"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleViewDetail(location)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalle Completo
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => openEdit(location)}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteTarget(location)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Map Dialog */}
      <MapDialog
        isOpen={showMapDialog}
        onClose={() => setShowMapDialog(false)}
        locations={headquarters}
      />

      {/* Form Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Sede' : 'Nueva Sede'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Actualiza la información de la sede'
                : 'Completa los datos para crear una nueva sede'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Sede *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Sede Norte"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección *</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Ej: Cra 100 #15-20"
              />
              <p className="text-xs text-muted-foreground">
                Requerido para mostrar la sede en el mapa
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad *</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Ej: Cali"
              />
              <p className="text-xs text-muted-foreground">
                Requerido para mostrar la sede en el mapa
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activa</SelectItem>
                  <SelectItem value="inactive">Inactiva</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Imagen de la Sede</Label>
              <ImageUpload
                value={form.image_url}
                onChange={(file, previewUrl) => {
                  setImageFile(file);
                  setForm({ ...form, image_url: previewUrl });
                }}
                label="Subir imagen de la sede"
                description="Formatos: JPG, PNG, WEBP. Máximo 5MB"
                maxSizeMB={5}
                accept="image/jpeg,image/png,image/webp"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editing ? 'Actualizar' : 'Crear Sede'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Detalle de Sede
            </DialogTitle>
          </DialogHeader>

          {selectedLocation && (
            <div className="space-y-6 py-4">
              {/* Imagen */}
              {selectedLocation.image_url && (
                <div className="w-full h-64 overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={selectedLocation.image_url}
                    alt={selectedLocation.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Información General */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Nombre</Label>
                      <p className="font-semibold">{selectedLocation.name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Estado</Label>
                      <div className="mt-1">
                        <Badge variant={selectedLocation.status === 'active' ? 'default' : 'secondary'}>
                          {selectedLocation.status === 'active' ? 'Activa' : 
                           selectedLocation.status === 'inactive' ? 'Inactiva' : 'Mantenimiento'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPinned className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <Label className="text-muted-foreground">Dirección</Label>
                        <p>{selectedLocation.address || 'No especificada'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <Label className="text-muted-foreground">Ciudad</Label>
                        <p>{selectedLocation.city || 'No especificada'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <Label className="text-muted-foreground">Fecha de Creación</Label>
                        <p>
                          {selectedLocation.created_at 
                            ? new Date(selectedLocation.created_at).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'No disponible'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estadísticas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Estadísticas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingDetails ? (
                    <p className="text-muted-foreground">Cargando estadísticas...</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Beneficiarios</p>
                        <p className="text-2xl font-bold text-blue-600">{beneficiaryCount}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Proyectos Asociados</p>
                        <p className="text-2xl font-bold text-green-600">{locationProjects.length}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Proyectos Asociados */}
              {locationProjects.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Proyectos Asociados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {locationProjects.map((project) => (
                        <div 
                          key={project.project_id}
                          className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold">{project.name}</h4>
                              {project.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {project.description}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline">
                              {project.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (selectedLocation) {
                  openEdit(selectedLocation);
                  setShowDetailDialog(false);
                }
              }}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button onClick={() => setShowDetailDialog(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmation
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            handleDelete(deleteTarget.headquarters_id);
          }
        }}
        title="¿Eliminar sede?"
        description={`¿Estás seguro de que deseas eliminar la sede "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default LocationsPage;
