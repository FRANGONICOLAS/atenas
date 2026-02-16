import { useState } from "react";
import { useSedeBeneficiaries } from "@/hooks/useSedeBeneficiaries";
import { FullScreenLoader } from "@/components/common/FullScreenLoader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeleteConfirmation from "@/components/modals/DeleteConfirmation";
import { UserCheck, Users, Plus, Download } from "lucide-react";
import type { Beneficiary } from "@/types/beneficiary.types";
import { BeneficiaryStats } from "@/pages/DirectorView/components/Beneficiaries/BeneficiaryStats";
import { BeneficiaryFilters } from "@/pages/DirectorView/components/Beneficiaries/BeneficiaryFilters";
import { BeneficiaryTable } from "@/pages/DirectorView/components/Beneficiaries/BeneficiaryTable";
import { BeneficiaryForm } from "@/pages/DirectorView/components/Beneficiaries/BeneficiaryForm";
import { BeneficiaryDetail } from "@/pages/DirectorView/components/Beneficiaries/BeneficiaryDetail";
import {
  calculateAge,
  getStatusBadge,
  getPerformanceColor,
} from "@/lib/beneficiaryUtils";

const BeneficiariesPage = () => {
  const {
    filtered,
    loading,
    search,
    setSearch,
    headquarterFilter,
    setHeadquarterFilter,
    categoryFilter,
    setCategoryFilter,
    statusFilter: statusTab,
    setStatusFilter: setStatusTab,
    headquarters,
    stats,
    handleSave,
    handleDelete,
    handleExportExcel,
    handleExportPDF,
    setPhotoFile,
    assignedHeadquarterId,
  } = useSedeBeneficiaries();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Beneficiary | null>(null);
  const [detail, setDetail] = useState<Beneficiary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Beneficiary | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    birth_date: "",
    category: "",
    headquarters_id: assignedHeadquarterId || "",
    status: "activo" as "activo" | "pendiente" | "inactivo" | "suspendido",
    sex: "",
    performance: 0,
    attendance: 0,
    registry_date: "",
    guardian: "",
    phone: "",
    address: "",
    emergency_contact: "",
    medical_info: "",
    photo_url: null as string | null,
    observation: "",
    anthropometric_detail: undefined as any,
    technical_tactic_detail: undefined as any,
    emotional_detail: undefined as any,
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      first_name: "",
      last_name: "",
      birth_date: "",
      category: "",
      headquarters_id: assignedHeadquarterId || "",
      status: "activo",
      sex: "",
      performance: 0,
      attendance: 0,
      registry_date: new Date().toISOString().split("T")[0],
      guardian: "",
      phone: "",
      address: "",
      emergency_contact: "",
      medical_info: "",
      photo_url: null,
      observation: "",
      anthropometric_detail: undefined,
      technical_tactic_detail: undefined,
      emotional_detail: undefined,
    });
    setShowForm(true);
  };

  const openEdit = (beneficiary: Beneficiary) => {
    setEditing(beneficiary);
    setForm({
      first_name: beneficiary.first_name,
      last_name: beneficiary.last_name,
      birth_date: beneficiary.birth_date,
      category: beneficiary.category,
      headquarters_id: beneficiary.headquarters_id,
      status:
        (beneficiary.status as
          | "activo"
          | "pendiente"
          | "inactivo"
          | "suspendido") || "activo",
      sex: beneficiary.sex || "",
      performance: beneficiary.performance || 0,
      attendance: beneficiary.attendance || 0,
      registry_date: beneficiary.registry_date,
      guardian: beneficiary.guardian || "",
      phone: beneficiary.phone,
      address: beneficiary.address || "",
      emergency_contact: beneficiary.emergency_contact || "",
      medical_info: beneficiary.medical_info || "",
      photo_url: beneficiary.photo_url || null,
      observation: beneficiary.observation || "",
      anthropometric_detail: beneficiary.anthropometric_detail,
      technical_tactic_detail: beneficiary.technical_tactic_detail,
      emotional_detail: beneficiary.emotional_detail,
    });
    setShowForm(true);
  };

  const handleSaveForm = async () => {
    const success = await handleSave(form, !!editing, editing?.beneficiary_id);
    if (success) {
      setShowForm(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;

    try {
      await handleDelete(
        deleteTarget.beneficiary_id,
        `${deleteTarget.first_name} ${deleteTarget.last_name}`,
      );
      setDeleteTarget(null);
      setShowDelete(false);
    } catch (error) {
      // Error ya manejado en el hook
    }
  };

  const handleExportExcelClick = () => {
    handleExportExcel(filtered);
  };

  const handleExportPDFClick = () => {
    handleExportPDF(filtered);
  };

  if (loading) {
    return <FullScreenLoader message="Cargando beneficiarios..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Beneficiarios</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcelClick}>
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDFClick}>
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* General Stats */}
      <BeneficiaryStats
        total={stats.total}
        active={stats.active}
        avgPerformance={stats.avgPerformance}
        avgAttendance={stats.avgAttendance}
      />

      {/* Controls and Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Beneficiarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BeneficiaryFilters
            search={search}
            onSearchChange={setSearch}
            headquarterFilter={headquarterFilter}
            onHeadquarterFilterChange={setHeadquarterFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            headquarters={headquarters}
          />

          <Tabs value={statusTab} onValueChange={setStatusTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="activo">Activos</TabsTrigger>
              <TabsTrigger value="pendiente">Pendientes</TabsTrigger>
              <TabsTrigger value="inactivo">Inactivos</TabsTrigger>
              <TabsTrigger value="suspendido">Suspendidos</TabsTrigger>
            </TabsList>
            <TabsContent value={statusTab} className="mt-4">
              <BeneficiaryTable
                beneficiaries={filtered}
                headquarters={headquarters}
                onView={setDetail}
                onEdit={openEdit}
                onDelete={(b) => {
                  setDeleteTarget(b);
                  setShowDelete(true);
                }}
                calculateAge={calculateAge}
                getStatusBadge={getStatusBadge}
                getPerformanceColor={getPerformanceColor}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <BeneficiaryForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSaveForm}
        isEditing={!!editing}
        form={form}
        setForm={setForm}
        headquarters={headquarters}
        setPhotoFile={setPhotoFile}
      />

      {/* Detail Dialog */}
      <BeneficiaryDetail
        beneficiary={detail}
        onClose={() => setDetail(null)}
        headquarters={headquarters}
        calculateAge={calculateAge}
        getStatusBadge={getStatusBadge}
        getPerformanceColor={getPerformanceColor}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmation
        open={showDelete}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => {
          setShowDelete(false);
          setDeleteTarget(null);
        }}
        title="¿Eliminar beneficiario?"
        description={
          deleteTarget
            ? `Estás a punto de eliminar "${deleteTarget.first_name} ${deleteTarget.last_name}". Esta acción no se puede deshacer.`
            : "Esta acción no se puede deshacer."
        }
      />
    </div>
  );
};

export default BeneficiariesPage;
