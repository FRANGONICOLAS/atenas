import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDirectorView } from "@/hooks/useDirectorView";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import DeleteConfirmation from "@/components/modals/DeleteConfirmation";
import { toast } from "sonner";
import {
  Target,
  Plus,
  Edit,
  Trash2,
  Download,
  X,
  CheckCircle2,
  TrendingUp,
  Building,
  Eye,
} from "lucide-react";
import {
  generateProjectsExcel,
  generateProjectsPDF,
} from "@/lib/reportGenerator";
import type { 
  Project, 
  ProjectType, 
  ProjectPriority,
  ProjectReport 
} from "@/types";

const HEADQUARTERS = [
  { id: 1, name: "Sede Norte" },
  { id: 2, name: "Sede Centro" },
  { id: 3, name: "Sede Sur" },
];

const getHqName = (id?: number) =>
  HEADQUARTERS.find((h) => h.id === id)?.name || "Sin sede";

const ProjectsPage = () => {
  const { user } = useAuth();
  const {
    projects,
    setProjects,
    projectSearch: search,
    setProjectSearch: setSearch,
    categoryFilter,
    setCategoryFilter,
    priorityFilter,
    setPriorityFilter,
    typeFilter,
    setTypeFilter,
    formatCurrency,
  } = useDirectorView();

  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [detailProject, setDetailProject] = useState<Project | null>(null);

  const [form, setForm] = useState({
    name: "",
    category: "" as string,
    type: "investment" as ProjectType,
    goal: 0,
    raised: 0,
    priority: "medium" as ProjectPriority,
    deadline: "",
    description: "",
    headquarters_id: undefined as number | undefined,
  });

  // Stats
  const stats = useMemo(() => {
    const total = projects.length;
    const totalGoal = projects.reduce((sum, p) => sum + p.goal, 0);
    const totalRaised = projects.reduce((sum, p) => sum + p.raised, 0);
    const totalRaisedFree = projects
      .filter((p) => p.type === "free")
      .reduce((sum, p) => sum + p.raised, 0);
    const completedCount = projects.filter((p) => p.progress >= 100).length;

    return [
      {
        title: "Proyectos Totales",
        value: total.toString(),
        color: "bg-blue-500",
      },
      {
        title: "En Curso",
        value: (total - completedCount).toString(),
        color: "bg-purple-500",
      },
      {
        title: "Meta Total",
        value: `$${(totalGoal / 1000000).toFixed(1)}M`,
        color: "bg-green-500",
      },
      {
        title: "Recaudado proyectos definidos",
        value: `$${(totalRaised / 1000000).toFixed(1)}M`,
        color: "bg-yellow-500",
      },
      {
        title: "Recaudado Inversión Libre",
        value: `$${(totalRaisedFree / 1000000).toFixed(1)}M`,
        color: "bg-teal-500",
      },
    ];
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || project.category === categoryFilter;
      const matchesPriority =
        priorityFilter === "all" || project.priority === priorityFilter;
      const matchesType = typeFilter === "all" || project.type === typeFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPriority &&
        matchesType
      );
    });
  }, [projects, search, categoryFilter, priorityFilter, typeFilter]);

  // Handlers
  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      category: "",
      type: "investment",
      goal: 0,
      raised: 0,
      priority: "medium",
      deadline: "",
      description: "",
      headquarters_id: undefined,
    });
    setShowDialog(true);
  };

  const openEdit = (project: Project) => {
    setEditing(project);
    setForm({
      name: project.name,
      category: project.category,
      type: project.type,
      goal: project.goal,
      raised: project.raised,
      priority: project.priority,
      deadline: project.deadline,
      description: project.description,
      headquarters_id: project.headquarters_id,
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!form.name || !form.category || !form.deadline) {
      toast.error("Campos requeridos", {
        description:
          "Por favor completa nombre, categoría y fecha límite",
      });
      return;
    }

    if (editing) {
      // Update
      const progress =
        form.goal > 0 ? Math.round((form.raised / form.goal) * 100) : 0;
      setProjects(
        projects.map((p) =>
          p.id === editing.id
            ? {
                ...form,
                id: p.id,
                progress,
              }
            : p
        )
      );
      toast.success("Proyecto actualizado", {
        description: `${form.name} ha sido actualizado correctamente`,
      });
    } else {
      // Create
      const progress =
        form.goal > 0 ? Math.round((form.raised / form.goal) * 100) : 0;
      const newProject: Project = {
        id: Math.max(...projects.map((p) => p.id), 0) + 1,
        ...form,
        progress,
      };
      setProjects([...projects, newProject]);
      toast.success("Proyecto creado", {
        description: `${form.name} ha sido creado correctamente`,
      });
    }

    setShowDialog(false);
    setForm({
      name: "",
      category: "",
      type: "investment",
      goal: 0,
      raised: 0,
      priority: "medium",
      deadline: "",
      description: "",
      headquarters_id: undefined,
    });
  };

  const initiateDelete = (project: Project) => {
    setDeleteTarget(project);
    setShowDeleteConfirm(true);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      setProjects(projects.filter((p) => p.id !== deleteTarget.id));
      toast.success("Proyecto eliminado", {
        description: `${deleteTarget.name} ha sido eliminado`,
      });
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

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

  const mapProjectsToReport = (items: Project[]): ProjectReport[] =>
    items.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      goal: p.goal,
      raised: p.raised,
      progress: p.progress,
      status: p.progress >= 100 ? "Completado" : "En curso",
    }));

  const handleExportExcel = () => {
    const data = mapProjectsToReport(filteredProjects);
    generateProjectsExcel(data, "proyectos");
    toast.success("Reporte Excel generado", {
      description: `Se exportaron ${data.length} proyectos`,
    });
  };

  const handleExportPDF = () => {
    const data = mapProjectsToReport(filteredProjects);
    generateProjectsPDF(data, "proyectos");
    toast.success("Reporte PDF generado", {
      description: `Se exportaron ${data.length} proyectos`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Proyectos</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Proyecto
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div
                className={`h-4 w-4 ${stat.color} rounded-full`}
              ></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <Input
                placeholder="Buscar proyectos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Deportes">Deportes</SelectItem>
                  <SelectItem value="Salud">Salud</SelectItem>
                  <SelectItem value="Infraestructura">
                    Infraestructura
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select
                value={priorityFilter}
                onValueChange={setPriorityFilter}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="investment">Inversión</SelectItem>
                  <SelectItem value="free">Inversión Libre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
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
              {filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center text-muted-foreground"
                  >
                    No hay proyectos registrados
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      {project.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{project.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {project.type === "investment"
                        ? "Inversión"
                        : "Inversión Libre"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Building className="h-3 w-3" />
                        {getHqName(project.headquarters_id)}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(project.goal)}</TableCell>
                    <TableCell>
                      {formatCurrency(project.raised)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={project.progress}
                          className="w-20"
                        />
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
                    <TableCell className="text-sm">
                      {project.deadline}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDetailProject(project)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(project)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => initiateDelete(project)}
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
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar Proyecto" : "Nuevo Proyecto"}
            </DialogTitle>
            <DialogDescription>
              Completa la información del proyecto
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre del proyecto *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
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
                    headquarters_id:
                      value === "none" ? undefined : parseInt(value),
                  })
                }
              >
                <SelectTrigger id="headquarters">
                  <SelectValue placeholder="Selecciona una sede..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin sede asignada</SelectItem>
                  {HEADQUARTERS.map((hq) => (
                    <SelectItem key={hq.id} value={hq.id.toString()}>
                      {hq.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="raised">Recaudado ($)</Label>
                <Input
                  id="raised"
                  type="number"
                  value={form.raised}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      raised: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
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
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editing ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog
        open={!!detailProject}
        onOpenChange={() => setDetailProject(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              {detailProject?.name}
            </DialogTitle>
            <DialogDescription>
              Detalles completos del proyecto
            </DialogDescription>
          </DialogHeader>

          {detailProject && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Categoría
                  </Label>
                  <p className="font-medium">
                    <Badge variant="outline">
                      {detailProject.category}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Tipo
                  </Label>
                  <p className="font-medium">
                    {detailProject.type === "investment"
                      ? "Inversión"
                      : "Inversión Libre"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Prioridad
                  </Label>
                  <p className="font-medium">
                    {getPriorityBadge(detailProject.priority)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Fecha límite
                  </Label>
                  <p className="font-medium">{detailProject.deadline}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Sede</Label>
                <p className="font-medium flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {getHqName(detailProject.headquarters_id)}
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
                      {formatCurrency(detailProject.goal)}
                    </p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">
                      Recaudado
                    </p>
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(detailProject.raised)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Progreso
                </Label>
                <div className="flex items-center gap-4">
                  <Progress
                    value={detailProject.progress}
                    className="flex-1"
                  />
                  <span
                    className={`text-xl font-bold ${getProgressColor(
                      detailProject.progress
                    )}`}
                  >
                    {detailProject.progress}%
                  </span>
                </div>
              </div>

              {detailProject.description && (
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Descripción
                  </Label>
                  <p className="text-sm mt-1">
                    {detailProject.description}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setDetailProject(null)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmation
        open={showDeleteConfirm}
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteTarget(null);
        }}
        title="¿Eliminar proyecto?"
        description={
          deleteTarget
            ? `Estás a punto de eliminar "${deleteTarget.name}". Esta acción no se puede deshacer.`
            : "Esta acción no se puede deshacer."
        }
      />
    </div>
  );
};

export default ProjectsPage;

