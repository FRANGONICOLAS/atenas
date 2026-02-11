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
import { Progress } from "@/components/ui/progress";
import { Edit, Trash2, Eye, Building } from "lucide-react";
import type { Project, ProjectPriority } from "@/types";

interface ProjectsTableProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onView: (project: Project) => void;
  formatCurrency: (value: number) => string;
  getHqName: (id?: number | string) => string;
}

export const ProjectsTable = ({
  projects,
  onEdit,
  onDelete,
  onView,
  formatCurrency,
  getHqName,
}: ProjectsTableProps) => {
  const getPriorityBadge = (priority: ProjectPriority) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="destructive" className="text-xs">
            Alta
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="default" className="text-xs">
            Media
          </Badge>
        );
      case "low":
        return (
          <Badge variant="secondary" className="text-xs">
            Baja
          </Badge>
        );
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "text-green-600";
    if (progress >= 75) return "text-blue-600";
    if (progress >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Proyecto</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Sede</TableHead>
          <TableHead>Meta</TableHead>
          <TableHead>Recaudado</TableHead>
          <TableHead>Progreso</TableHead>
          <TableHead>Prioridad</TableHead>
          <TableHead>Fecha límite</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={10}
              className="text-center text-muted-foreground"
            >
              No hay proyectos registrados
            </TableCell>
          </TableRow>
        ) : (
          projects.map((project, index) => (
            <TableRow key={`${project.id}-${index}`}>
              <TableCell className="font-medium">{project.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{project.category}</Badge>
              </TableCell>
              <TableCell>
                {project.type === "investment" ? "Inversión" : "Inversión Libre"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Building className="h-3 w-3" />
                  {getHqName(project.headquarters_id)}
                </div>
              </TableCell>
              <TableCell>{formatCurrency(project.goal)}</TableCell>
              <TableCell>{formatCurrency(project.raised)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress value={project.progress} className="w-20" />
                  <span
                    className={`text-xs font-medium ${getProgressColor(
                      project.progress
                    )}`}
                  >
                    {project.progress}%
                  </span>
                </div>
              </TableCell>
              <TableCell>{getPriorityBadge(project.priority)}</TableCell>
              <TableCell className="text-sm">{project.deadline}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(project)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(project)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(project)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
