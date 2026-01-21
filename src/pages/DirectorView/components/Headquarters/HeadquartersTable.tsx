import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Headquarter } from "@/types";

interface HeadquartersTableProps {
  headquarters: Headquarter[];
  loading: boolean;
  onEdit: (hq: Headquarter) => void;
  onToggleStatus: (id: string, nextStatus: string) => void;
  onDelete: (hq: Headquarter) => void;
}

export const HeadquartersTable = ({
  headquarters,
  loading,
  onEdit,
  onToggleStatus,
  onDelete,
}: HeadquartersTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Dirección</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground"
              >
                Cargando sedes...
              </TableCell>
            </TableRow>
          ) : headquarters.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground"
              >
                No hay sedes que coincidan con los filtros
              </TableCell>
            </TableRow>
          ) : (
            headquarters.map((hq) => (
              <TableRow key={hq.headquarters_id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{hq.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {hq.address || "Sin dirección"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      hq.status === "active"
                        ? "default"
                        : hq.status === "maintenance"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {hq.status === "active"
                      ? "Activa"
                      : hq.status === "maintenance"
                      ? "Mantenimiento"
                      : "Inactiva"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => onEdit(hq)}
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:text-red-600"
                    onClick={() => onDelete(hq)}
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
