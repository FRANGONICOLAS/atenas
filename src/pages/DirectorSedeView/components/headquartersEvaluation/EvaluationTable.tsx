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
import { BarChart3, Edit, Trash2 } from "lucide-react";
import type { Evaluation } from "@/types";

interface EvaluationTableProps {
  evaluations: Evaluation[];
  onView: (evaluation: Evaluation) => void;
  onEdit: (evaluation: Evaluation) => void;
  onDelete: (evaluation: Evaluation) => void;
  formatDate: (dateString: string) => string;
  getPerformanceColor: (value: number) => string;
  getTypeLabel: (type: Evaluation['type']) => string;
}

export const EvaluationTable = ({
  evaluations,
  onView,
  onEdit,
  onDelete,
  formatDate,
  getPerformanceColor,
  getTypeLabel,
}: EvaluationTableProps) => {
  if (evaluations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay evaluaciones que coincidan con los filtros
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Beneficiario</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {evaluations.map((evaluation) => (
            <TableRow key={evaluation.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">
                {evaluation.beneficiaryName}
              </TableCell>
              <TableCell>
                {getTypeLabel(evaluation.type)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(evaluation.date)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => onView(evaluation)}
                    title="Ver detalle"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => onEdit(evaluation)}
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:text-red-600"
                    onClick={() => onDelete(evaluation)}
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
