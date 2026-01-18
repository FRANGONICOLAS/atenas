import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Target, Building } from "lucide-react";
import type { Project, ProjectPriority } from "@/types";

interface ProjectDetailDialogProps {
  project: Project | null;
  open: boolean;
  onClose: () => void;
  formatCurrency: (value: number) => string;
  getHqName: (id?: number | string) => string;
}

export const ProjectDetailDialog = ({
  project,
  open,
  onClose,
  formatCurrency,
  getHqName,
}: ProjectDetailDialogProps) => {
  if (!project) return null;

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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            {project.name}
          </DialogTitle>
          <DialogDescription>Detalles completos del proyecto</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Categoría</Label>
              <p className="font-medium">
                <Badge variant="outline">{project.category}</Badge>
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Tipo</Label>
              <p className="font-medium">
                {project.type === "investment" ? "Inversión" : "Inversión Libre"}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Prioridad</Label>
              <p className="font-medium">{getPriorityBadge(project.priority)}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Fecha límite
              </Label>
              <p className="font-medium">{project.deadline}</p>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Sede</Label>
            <p className="font-medium flex items-center gap-2">
              <Building className="h-4 w-4" />
              {getHqName(project.headquarters_id)}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Financiamiento
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Meta</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(project.goal)}
                </p>
              </div>
              <div className="border rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Recaudado</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(project.raised)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Progreso</Label>
            <div className="flex items-center gap-4">
              <Progress value={project.progress} className="flex-1" />
              <span
                className={`text-xl font-bold ${getProgressColor(
                  project.progress
                )}`}
              >
                {project.progress}%
              </span>
            </div>
          </div>

          {project.description && (
            <div>
              <Label className="text-xs text-muted-foreground">
                Descripción
              </Label>
              <p className="text-sm mt-1">{project.description}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
