import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Project, ProjectType, ProjectPriority, Headquarter } from "@/types";

interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
  project: Project | null;
  onSave: (data: {
    name: string;
    category: string;
    type: ProjectType;
    goal: number;
    priority: ProjectPriority;
    deadline: string;
    description: string;
    headquarters_id?: string | number;
  }) => Promise<void>;
  headquarters: Headquarter[];
}

export const ProjectDialog = ({
  open,
  onClose,
  project,
  onSave,
  headquarters,
}: ProjectDialogProps) => {
  const [form, setForm] = useState({
    name: "",
    category: "",
    type: "investment" as ProjectType,
    goal: 0,
    priority: "medium" as ProjectPriority,
    deadline: "",
    description: "",
    headquarters_id: undefined as number | string | undefined,
  });

  useEffect(() => {
    if (project) {
      setForm({
        name: project.name,
        category: project.category,
        type: project.type,
        goal: project.goal,
        priority: project.priority,
        deadline: project.deadline,
        description: project.description,
        headquarters_id: project.headquarters_id
          ? String(project.headquarters_id)
          : undefined,
      });
    } else {
      setForm({
        name: "",
        category: "",
        type: "investment",
        goal: 0,
        priority: "medium",
        deadline: "",
        description: "",
        headquarters_id: undefined,
      });
    }
  }, [project, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {project ? "Editar Proyecto" : "Nuevo Proyecto"}
          </DialogTitle>
          <DialogDescription>
            Completa la información del proyecto
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre del proyecto *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) =>
                    setForm({ ...form, category: value })
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Deportes">Deportes</SelectItem>
                    <SelectItem value="Salud">Salud</SelectItem>
                    <SelectItem value="Infraestructura">
                      Infraestructura
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Tipo *</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) =>
                    setForm({ ...form, type: value as ProjectType })
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="investment">Inversión</SelectItem>
                    <SelectItem value="free">Inversión Libre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Prioridad *</Label>
                <Select
                  value={form.priority}
                  onValueChange={(value) =>
                    setForm({
                      ...form,
                      priority: value as ProjectPriority,
                    })
                  }
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="low">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="deadline">Fecha límite *</Label>
                <Input
                  id="deadline"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm({ ...form, deadline: e.target.value })
                  }
                  placeholder="DD Mon YYYY"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="headquarters">Sede</Label>
              <Select
                value={form.headquarters_id?.toString() || "none"}
                onValueChange={(value) =>
                  setForm({
                    ...form,
                    headquarters_id: value === "none" ? undefined : value,
                  })
                }
              >
                <SelectTrigger id="headquarters">
                  <SelectValue placeholder="Selecciona una sede..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin sede asignada</SelectItem>
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
            </div>

            <div className="grid gap-2">
              <Label htmlFor="goal">Meta ($) *</Label>
              <Input
                id="goal"
                type="number"
                value={form.goal}
                onChange={(e) =>
                  setForm({
                    ...form,
                    goal: parseInt(e.target.value) || 0,
                  })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{project ? "Actualizar" : "Crear"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
