import "leaflet/dist/leaflet.css";
import DeleteConfirmation from "@/components/modals/DeleteConfirmation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Plus } from "lucide-react";
import { useHeadquarters } from "@/hooks/useHeadquarters";
import { HeadquarterStats } from "../components/Headquarters/HeadquarterStats";
import { HeadquarterFilters } from "../components/Headquarters/HeadquarterFilters";
import { HeadquartersTable } from "../components/Headquarters/HeadquartersTable";
import { HeadquartersMap } from "../components/Headquarters/HeadquartersMap";
import { HeadquartersDialog } from "../components/Headquarters/HeadquartersDialog";

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
    setImageFile,
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
              onEdit={openEdit}
              onToggleStatus={toggleStatus}
              onDelete={setDeleteTarget}
            />
          </div>
        </CardContent>
      </Card>

      {/* Map with all headquarters */}
      <HeadquartersMap mapRef={mapRef} headquarters={headquarters} />

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
