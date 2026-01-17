import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Eye, Trash2 } from "lucide-react";
import type { Beneficiary } from "@/types/beneficiary.types";
import type { Headquarter } from "@/types";

interface BeneficiaryTableProps {
  beneficiaries: Beneficiary[];
  headquarters: Headquarter[];
  onView: (beneficiary: Beneficiary) => void;
  onEdit: (beneficiary: Beneficiary) => void;
  onDelete: (beneficiary: Beneficiary) => void;
  calculateAge: (birthDate: string) => number;
  getStatusBadge: (status: string) => React.ReactNode;
  getPerformanceColor: (value: number) => string;
}

export const BeneficiaryTable = ({
  beneficiaries,
  headquarters,
  onView,
  onEdit,
  onDelete,
  calculateAge,
  getStatusBadge,
  getPerformanceColor,
}: BeneficiaryTableProps) => {
  if (beneficiaries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay beneficiarios que coincidan con los filtros
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
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
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {beneficiaries.map((b) => {
            const hq = headquarters.find(
              (h) => h.headquarters_id === b.headquarters_id,
            );
            const age = calculateAge(b.birth_date);
            return (
              <TableRow key={b.beneficiary_id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {b.first_name} {b.last_name}
                </TableCell>
                <TableCell>{age} años</TableCell>
                <TableCell>
                  <Badge variant="outline">{b.category}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {hq?.name || "N/A"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={b.performance || 0} className="w-16" />
                    <span
                      className={`text-sm font-medium ${getPerformanceColor(
                        b.performance || 0,
                      )}`}
                    >
                      {b.performance || 0}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`text-sm font-medium ${getPerformanceColor(
                      b.attendance || 0,
                    )}`}
                  >
                    {b.attendance || 0}%
                  </span>
                </TableCell>
                <TableCell>{getStatusBadge(b.status || "inactivo")}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => onView(b)}
                    title="Ver detalle"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => onEdit(b)}
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:text-red-600"
                    onClick={() => onDelete(b)}
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
