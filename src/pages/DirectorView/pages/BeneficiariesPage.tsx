import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDirectorView } from "@/hooks/useDirectorView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeleteConfirmation from "@/components/modals/DeleteConfirmation";
import { UserCheck, Users, Plus, Download } from "lucide-react";
import type { Beneficiary } from "@/types/beneficiary.types";
import { BeneficiaryStatsCard } from "../components/BeneficiaryStatsCard";
import { BeneficiaryTable } from "../components/BeneficiaryTable";
import { BeneficiaryForm } from "../components/BeneficiaryForm";
import { BeneficiaryDetail } from "../components/BeneficiaryDetail";

const BeneficiariesPage = () => {
  const {
    beneficiarySearch: search,
    setBeneficiarySearch: setSearch,
    headquarterFilter,
    setHeadquarterFilter,
    categoryBeneficiaryFilter: categoryFilter,
    setCategoryBeneficiaryFilter: setCategoryFilter,
    statusFilter: statusTab,
    setStatusFilter: setStatusTab,
    headquarters,
    calculateAge,
    getStatusBadge,
    getPerformanceColor,
    filteredBeneficiaries,
    sedeStats,
    handleSaveBeneficiary,
    handleDeleteBeneficiary,
    handleExportBeneficiariesExcel,
    handleExportBeneficiariesPDF,
  } = useDirectorView();

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
    headquarters_id: "",
    status: "activo" as "activo" | "pendiente" | "inactivo" | "suspendido",
    performance: 0,
    attendance: 0,
    registry_date: "",
    guardian: "",
    phone: "",
    address: "",
    emergency_contact: "",
    medical_info: "",
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      first_name: "",
      last_name: "",
      birth_date: "",
      category: "",
      headquarters_id: "",
      status: "activo",
      performance: 0,
      attendance: 0,
      registry_date: new Date().toISOString().split("T")[0],
      guardian: "",
      phone: "",
      address: "",
      emergency_contact: "",
      medical_info: "",
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
      performance: beneficiary.performance || 0,
      attendance: beneficiary.attendance || 0,
      registry_date: beneficiary.registry_date,
      guardian: beneficiary.guardian || "",
      phone: beneficiary.phone,
      address: beneficiary.address || "",
      emergency_contact: beneficiary.emergency_contact || "",
      medical_info: beneficiary.medical_info || "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    const success = await handleSaveBeneficiary(
      form,
      !!editing,
      editing?.beneficiary_id,
    );
    if (success) {
      setShowForm(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await handleDeleteBeneficiary(
        deleteTarget.beneficiary_id,
        `${deleteTarget.first_name} ${deleteTarget.last_name}`,
      );
      setDeleteTarget(null);
      setShowDelete(false);
    } catch (error) {
      // Error ya manejado en el hook
    }
  };

  const handleExportExcel = () => {
    handleExportBeneficiariesExcel(filteredBeneficiaries);
  };

  const handleExportPDF = () => {
    handleExportBeneficiariesPDF(filteredBeneficiaries);
  };

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
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Stats by Sede */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sedeStats.map((stat) => (
          <BeneficiaryStatsCard
            key={stat.name}
            name={stat.name}
            total={stat.total}
            active={stat.active}
            avgPerf={stat.avgPerf}
          />
        ))}
      </div>

      {/* Controls and Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Beneficiarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select
                value={headquarterFilter}
                onValueChange={setHeadquarterFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todas las sedes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las sedes</SelectItem>
                  {headquarters.map((hq) => (
                    <SelectItem
                      key={hq.headquarters_id}
                      value={hq.headquarters_id}
                    >
                      {hq.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="Categoría 1">Categoría 1 (6-7)</SelectItem>
                  <SelectItem value="Categoría 2">Categoría 2 (8-9)</SelectItem>
                  <SelectItem value="Categoría 3">
                    Categoría 3 (10-11)
                  </SelectItem>
                  <SelectItem value="Categoría 4">
                    Categoría 4 (12-14)
                  </SelectItem>
                  <SelectItem value="Categoría 5">
                    Categoría 5 (15-17)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs value={statusTab} onValueChange={setStatusTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="activo">Activos</TabsTrigger>
                <TabsTrigger value="pendiente">Pendientes</TabsTrigger>
                <TabsTrigger value="inactivo">Inactivos</TabsTrigger>
                <TabsTrigger value="suspendido">Suspendidos</TabsTrigger>
              </TabsList>
              <TabsContent value={statusTab} className="mt-4">
                <BeneficiaryTable
                  beneficiaries={filteredBeneficiaries}
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
          </div>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <BeneficiaryForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
        isEditing={!!editing}
        form={form}
        setForm={setForm}
        headquarters={headquarters}
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
        onConfirm={handleDelete}
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
