import { useMemo, useState } from "react";
import { Trophy, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Beneficiary } from "@/types/beneficiary.types";

interface BeneficiariesTableProps {
  beneficiaries: Beneficiary[];
  headquarters?: { headquarters_id: string; name: string }[];
  onViewBeneficiary: (beneficiary: Beneficiary) => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
}

// Calcula la edad a partir de la fecha de nacimiento
const calculateAge = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const getStatusBadge = (status?: string) => {
  switch (status) {
    case "activo":
      return <Badge variant="default">Activo</Badge>;
    case "pendiente":
      return <Badge variant="secondary">Pendiente</Badge>;
    case "inactivo":
      return <Badge variant="outline">Inactivo</Badge>;
    case "suspendido":
      return <Badge variant="destructive">Suspendido</Badge>;
    default:
      return <Badge variant="default">Activo</Badge>;
  }
};

const getPerformanceColor = (performance?: number) => {
  if (!performance) return "text-gray-400";
  if (performance >= 90) return "text-green-600";
  if (performance >= 75) return "text-blue-600";
  if (performance >= 60) return "text-yellow-600";
  return "text-red-600";
};

export const BeneficiariesTable = ({
  beneficiaries,
  headquarters = [],
  onViewBeneficiary,
  onExportExcel,
  onExportPDF,
}: BeneficiariesTableProps) => {
  const [selectedHeadquarter, setSelectedHeadquarter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  // Obtener lista única de categorías de los beneficiarios
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(beneficiaries.map((b) => b.category)),
    );
    return uniqueCategories.sort();
  }, [beneficiaries]);

  const filteredBeneficiaries = useMemo(() => {
    return beneficiaries.filter((beneficiary) => {
      const matchesHeadquarter =
        selectedHeadquarter === "all" ||
        beneficiary.headquarters_id === selectedHeadquarter;
      const matchesCategory =
        selectedCategory === "all" || beneficiary.category === selectedCategory;
      const matchesTab =
        activeTab === "all" ||
        beneficiary.status === activeTab ||
        (!beneficiary.status && activeTab === "activo");
      return matchesHeadquarter && matchesCategory && matchesTab;
    });
  }, [selectedHeadquarter, selectedCategory, activeTab, beneficiaries]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Beneficiarios
          </span>
        </CardTitle>
        {/* Filtros */}
        <div className="flex gap-2 mt-4">
          <Select
            value={selectedHeadquarter}
            onValueChange={setSelectedHeadquarter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todas las sedes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las sedes</SelectItem>
              {headquarters.map((hq) => (
                <SelectItem key={hq.headquarters_id} value={hq.headquarters_id}>
                  {hq.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
              <SelectItem value="Sede Sur">Sede Sur</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="Categoria 1">Categoria 1 (6-8)</SelectItem>
              <SelectItem value="Categoria 2">Categoria 2 (8-10)</SelectItem>
              <SelectItem value="Categoria 3">Categoria 3 (10-12)</SelectItem>
              <SelectItem value="Categoria 4">Categoria 4 (12-15)</SelectItem>
              <SelectItem value="Categoria 5">Categoria 5 (15-17)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onExportExcel}>
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={onExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="activo">Activos</TabsTrigger>
            <TabsTrigger value="pendiente">Pendientes</TabsTrigger>
            <TabsTrigger value="inactivo">Inactivos</TabsTrigger>
            <TabsTrigger value="suspendido">Suspendidos</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-4">
            {filteredBeneficiaries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay beneficiarios que coincidan con los filtros seleccionados
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre Completo</TableHead>
                    <TableHead>Edad</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Rendimiento</TableHead>
                    <TableHead>Asistencia</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBeneficiaries.map((beneficiary) => {
                    const age = calculateAge(beneficiary.birth_date);
                    const headquarter = headquarters.find(
                      (hq) =>
                        hq.headquarters_id === beneficiary.headquarters_id,
                    );

                    return (
                      <TableRow
                        key={beneficiary.beneficiary_id}
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => onViewBeneficiary(beneficiary)}
                      >
                        <TableCell className="font-medium">
                          {beneficiary.first_name} {beneficiary.last_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {beneficiary.category.charAt(0).toUpperCase() +
                              beneficiary.category.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {beneficiary.phone}
                        </TableCell>
                        <TableCell>
                          {beneficiary.performance !== undefined &&
                          beneficiary.performance !== null ? (
                            <div className="flex items-center gap-2">
                              <Progress
                                value={beneficiary.performance}
                                className="w-16"
                              />
                              <span
                                className={`text-sm font-medium ${getPerformanceColor(
                                  beneficiary.performance,
                                )}`}
                              >
                                {beneficiary.performance}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              N/A
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {beneficiary.attendance !== undefined &&
                          beneficiary.attendance !== null ? (
                            <span
                              className={`text-sm font-medium ${getPerformanceColor(
                                beneficiary.attendance,
                              )}`}
                            >
                              {beneficiary.attendance}%
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              N/A
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(beneficiary.status)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
