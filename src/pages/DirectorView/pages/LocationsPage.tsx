import {
  MapPin, Plus, Pencil, Trash2, Eye, Users, MapPinned, Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FullScreenLoader } from "@/components/common/FullScreenLoader";
import { MapDialog, HeadquarterDetail, HeadquartersDialog } from "../components";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Headquarter } from "@/types";
import { useHeadquarters } from "@/hooks/useHeadquarters";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { headquarterService } from "@/api/services";
import type { Project } from "@/types/project.types";
import DeleteConfirmation from "@/components/modals/DeleteConfirmation";

const LocationsPage = () => {
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Headquarter | null>(null);
  const [locationProjects, setLocationProjects] = useState<Project[]>([]);
  const [beneficiaryCount, setBeneficiaryCount] = useState(0);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const {
    headquarters, loading, showDialog, editing, form, deleteTarget,
    setShowDialog, setForm, setDeleteTarget, setImageFile,
    openCreate, openEdit, handleSave, handleDelete,
  } = useHeadquarters();

  const handleViewDetail = async (location: Headquarter) => {
    setSelectedLocation(location);
    setLoadingDetails(true);
    try {
      const [count, projectsData] = await Promise.all([
        headquarterService.getBeneficiaryCount(location.headquarters_id),
        headquarterService.getProjects(location.headquarters_id),
      ]);
      setBeneficiaryCount(count);
      setLocationProjects(projectsData.map((p) => p.project));
    } catch {
      toast.error("Error al cargar los detalles");
    } finally {
      setLoadingDetails(false);
    }
  };

  if (loading) return <FullScreenLoader message="Cargando sedes..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Sedes</h2>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="w-4 h-4" /> Nueva Sede
        </Button>
      </div>

      {headquarters.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No hay sedes registradas</p>
            <Button className="mt-4" onClick={openCreate}>Crear primera sede</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {headquarters.map((location) => (
            <Card key={location.headquarters_id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {location.image_url && (
                <div className="h-40 overflow-hidden bg-gray-100">
                  <img src={location.image_url} alt={location.name} className="w-full h-full object-cover" />
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{location.name}</h3>
                    <p className="text-sm text-muted-foreground">{location.address || "Sin dirección"}</p>
                    {location.city && <p className="text-sm text-muted-foreground">{location.city}</p>}
                  </div>
                  <Badge variant={location.status === "active" ? "default" : "secondary"}>
                    {location.status === "active" ? "Activa" : "Inactiva"}
                  </Badge>
                </div>
                <Separator className="my-3" />
                <div className="space-y-2">
                  <Button size="default" className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleViewDetail(location)}>
                    <Eye className="w-4 h-4 mr-2" /> Ver Detalle Completo
                  </Button>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(location)}>
                      <Pencil className="w-4 h-4 mr-1" /> Editar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(location)}>
                      <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <MapDialog isOpen={showMapDialog} onClose={() => setShowMapDialog(false)} locations={headquarters} />

      <HeadquartersDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        isEditing={!!editing}
        form={{ name: form.name, status: form.status, address: form.address, city: form.city, image_url: form.image_url }}
        onFormChange={(field, value) => setForm({ ...form, [field]: value })}
        onImageChange={(file, previewUrl) => { setImageFile(file); setForm({ ...form, image_url: previewUrl }); }}
        onSave={handleSave}
      />

      <HeadquarterDetail
        headquarter={selectedLocation}
        beneficiariesStats={selectedLocation ? { total: beneficiaryCount, active: beneficiaryCount } : undefined}
        projects={locationProjects}
        onClose={() => { setSelectedLocation(null); setLocationProjects([]); }}
      />

      <DeleteConfirmation
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget.headquarters_id); }}
        title="¿Eliminar sede?"
        description={`¿Estás seguro de que deseas eliminar la sede "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default LocationsPage;
