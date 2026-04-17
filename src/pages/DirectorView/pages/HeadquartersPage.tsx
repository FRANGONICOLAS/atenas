import "leaflet/dist/leaflet.css";
import DeleteConfirmation from "@/components/modals/DeleteConfirmation";
import { FullScreenLoader } from '@/components/common/FullScreenLoader';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Plus, Pencil, MapPin, MapPinned, Calendar, Users } from "lucide-react";
import { useHeadquarters } from "@/hooks/useHeadquarters";
import { HeadquarterStats } from "../components/Headquarters/HeadquarterStats";
import { HeadquarterFilters } from "../components/Headquarters/HeadquarterFilters";
import { HeadquartersTable } from "../components/Headquarters/HeadquartersTable";
import { HeadquartersMap } from "../components/Headquarters/HeadquartersMap";
import { HeadquartersDialog } from "../components/Headquarters/HeadquartersDialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";
import { headquarterService } from "@/api/services";
import type { Headquarter, Project } from "@/types";

const HeadquartersPage = () => {
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Headquarter | null>(null);
  const [locationProjects, setLocationProjects] = useState<Project[]>([]);
  const [beneficiaryCount, setBeneficiaryCount] = useState(0);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const {
    headquarters,
    loading,
    search,
    statusFilter,
    showDialog,
    editing,
    form,
    deleteTarget,
    filtered,
    stats,
    mapRef,
    selectedHeadquarter,
    beneficiariesByHeadquarter,
    setSearch,
    setStatusFilter,
    setShowDialog,
    setForm,
    setDeleteTarget,
    setImageFile,
    setSelectedHeadquarter,
    openCreate,
    openEdit,
    handleSave,
    handleDelete,
    toggleStatus,
  } = useHeadquarters();

  const handleViewDetail = async (location: Headquarter) => {
    setSelectedLocation(location);
    setShowDetailDialog(true);
    setLoadingDetails(true);

    try {
      // Cargar conteo de beneficiarios
      const count = await headquarterService.getBeneficiaryCount(location.headquarters_id);
      setBeneficiaryCount(count);

      // Cargar proyectos asociados
      const projectsData = await headquarterService.getProjects(location?.headquarters_id);
      setLocationProjects(projectsData.map(p => p.project));
    } catch (error) {
      toast.error('Error al cargar los detalles');
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
          <Building2 className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Sedes</h2>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Sede
        </Button>
      </div>

      {/* Stats */}
      <HeadquarterStats total={stats.total} active={stats.active} />

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Sedes Registradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <HeadquarterFilters
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />

            {/* Table */}
            <HeadquartersTable
              headquarters={filtered}
              loading={loading}
              onView={handleViewDetail}
              onEdit={openEdit}
              onToggleStatus={toggleStatus}
              onDelete={setDeleteTarget}
            />
          </div>
        </CardContent>
      </Card>

      {/* Map with all headquarters */}
      <HeadquartersMap 
        mapRef={mapRef} 
        headquarters={headquarters}
        selectedHeadquarter={selectedHeadquarter}
        beneficiariesByHeadquarter={beneficiariesByHeadquarter}
        onCloseDetail={() => setSelectedHeadquarter(null)}
      />

      {/* Dialog */}
      <HeadquartersDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        isEditing={!!editing}
        form={form}
        onFormChange={(field, value) => setForm({ ...form, [field]: value })}
        onImageChange={(file, previewUrl) => {
          setImageFile(file);
          setForm({ ...form, image_url: previewUrl });
        }}
        onSave={handleSave}
      />

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
                            <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                              {project.status === 'active' ? 'Activo' : project.status === 'completed' ? 'Completado' : project.status === 'pending' ? 'Pendiente' : project.status}
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

      <DeleteConfirmation
        open={Boolean(deleteTarget)}
        targetName={deleteTarget?.name}
        description="Esta acción no se puede deshacer. Se eliminará la sede seleccionada."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() =>
          deleteTarget && handleDelete(deleteTarget.headquarters_id)
        }
      />
    </div>
  );
};

export default HeadquartersPage;
