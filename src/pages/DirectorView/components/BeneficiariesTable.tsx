import { useMemo, useState } from 'react';
import { Trophy, Download, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Beneficiary {
  id: number;
  name: string;
  age: number;
  category: string;
  location: string;
  status: string;
  performance: number;
  attendance: number;
}

interface BeneficiariesTableProps {
  beneficiaries: Beneficiary[];
  onViewBeneficiary: (beneficiary: Beneficiary) => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge variant="default">Activo</Badge>;
    case "pending":
      return <Badge variant="secondary">Pendiente</Badge>;
    case "inactive":
      return <Badge variant="outline">Inactivo</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const getPerformanceColor = (performance: number) => {
  if (performance >= 90) return "text-green-600";
  if (performance >= 75) return "text-blue-600";
  if (performance >= 60) return "text-yellow-600";
  return "text-red-600";
};

export const BeneficiariesTable = ({
  beneficiaries,
  onViewBeneficiary,
  onExportExcel,
  onExportPDF,
}: BeneficiariesTableProps) => {
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  const filteredBeneficiaries = useMemo(() => {
    return beneficiaries.filter((beneficiary) => {
      const matchesLocation =
        selectedLocation === "all" || beneficiary.location === selectedLocation;
      const matchesCategory =
        selectedCategory === "all" || beneficiary.category === selectedCategory;
      const matchesTab = activeTab === "all" || beneficiary.status === activeTab;
      return matchesLocation && matchesCategory && matchesTab;
    });
  }, [selectedLocation, selectedCategory, activeTab, beneficiaries]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Niños Recientes
          </span>
        </CardTitle>
        {/* Filtros */}
        <div className="flex gap-2 mt-4">
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todas las sedes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las sedes</SelectItem>
              <SelectItem value="Sede Norte">Sede Norte</SelectItem>
              <SelectItem value="Sede Centro">Sede Centro</SelectItem>
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
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="active">Activos</TabsTrigger>
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="inactive">Inactivos</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-4">
            {filteredBeneficiaries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay niños que coincidan con los filtros seleccionados
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Edad</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Sede</TableHead>
                    <TableHead>Rendimiento</TableHead>
                    <TableHead>Asistencia</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBeneficiaries.map((beneficiary) => (
                    <TableRow
                      key={beneficiary.id}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => onViewBeneficiary(beneficiary)}
                    >
                      <TableCell className="font-medium">
                        {beneficiary.name}
                      </TableCell>
                      <TableCell>{beneficiary.age} años</TableCell>
                      <TableCell>
                        <Badge variant="outline">{beneficiary.category}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {beneficiary.location}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={beneficiary.performance}
                            className="w-16"
                          />
                          <span
                            className={`text-sm font-medium ${getPerformanceColor(
                              beneficiary.performance
                            )}`}
                          >
                            {beneficiary.performance}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-sm font-medium ${getPerformanceColor(
                            beneficiary.attendance
                          )}`}
                        >
                          {beneficiary.attendance}%
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(beneficiary.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
