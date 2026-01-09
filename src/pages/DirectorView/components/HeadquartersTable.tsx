import { MapPin, Edit, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Sedes Registradas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando sedes...</div>
        ) : (
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
              {headquarters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    No hay sedes que coincidan con el filtro
                  </TableCell>
                </TableRow>
              ) : (
                headquarters.map((hq) => (
                  <TableRow key={hq.headquarters_id}>
                    <TableCell className="font-medium">{hq.name}</TableCell>
                    <TableCell>{hq.address || "Sin dirección"}</TableCell>
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
                      <Button size="icon" variant="ghost" onClick={() => onEdit(hq)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        className={
                          hq.status === "active"
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }
                        onClick={() =>
                          onToggleStatus(
                            hq.headquarters_id,
                            hq.status === "active" ? "inactive" : "active"
                          )
                        }
                      >
                        {hq.status === "active" ? "Desactivar" : "Activar"}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDelete(hq)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
