import "leaflet/dist/leaflet.css";
import DeleteConfirmation from "@/components/modals/DeleteConfirmation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MapPin, Building2, Plus, Search } from "lucide-react";
import { useHeadquarters } from "@/hooks/useHeadquarters";
import { HeadquartersTable } from "../components/";
import { HeadquartersMap } from "../components/";

const HeadquartersPage = () => {
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
    setSearch,
    setStatusFilter,
    setShowDialog,
    setForm,
    setDeleteTarget,
    openCreate,
    openEdit,
    handleSave,
    handleDelete,
    toggleStatus,
  } = useHeadquarters();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Sedes</h2>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Nueva Sede
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total de Sedes</div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Sedes Activas</div>
            <div className="text-3xl font-bold text-green-600">
              {stats.active}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nombre o dirección"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activas</SelectItem>
            <SelectItem value="inactive">Inactivas</SelectItem>
            <SelectItem value="maintenance">Mantenimiento</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <HeadquartersTable
        headquarters={filtered}
        loading={loading}
        onEdit={openEdit}
        onToggleStatus={toggleStatus}
        onDelete={setDeleteTarget}
      />

      {/* Map with all headquarters */}
      <HeadquartersMap mapRef={mapRef} headquarters={headquarters} />

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {editing ? "Editar Sede" : "Nueva Sede"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Actualiza la información de la sede"
                : "Completa los datos para registrar una nueva sede"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Sede Norte"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado *</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
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
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Dirección *</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  placeholder="Calle 35 #13-39"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="city">Ciudad *</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Cali, Valle del Cauca, Colombia"
                />
                <p className="text-xs text-muted-foreground">
                  Se recomienda incluir ciudad, departamento y país para mayor
                  precisión.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Guardar</Button>
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
