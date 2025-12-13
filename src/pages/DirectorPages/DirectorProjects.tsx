import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
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
  Calendar,
  Building,
  Eye,
} from "lucide-react";
import {
  generateProjectsExcel,
  generateProjectsPDF,
  ProjectReport,
} from "@/lib/reportGenerator";

type ProjectType = "investment" | "free";
type ProjectPriority = "high" | "medium" | "low";

const HEADQUARTERS = [
  { id: 1, name: "Sede Norte" },
  { id: 2, name: "Sede Centro" },
  { id: 3, name: "Sede Sur" },
];

const getHqName = (id?: number) =>
  HEADQUARTERS.find((h) => h.id === id)?.name || "Sin sede";

interface Project {
  id: number;
  name: string;
  category: string;
  type: ProjectType;
  goal: number;
  raised: number;
  progress: number;
  priority: ProjectPriority;
  deadline: string;
  description: string;
  headquarters_id?: number; // relacionar con sede (concordar con DirectorHeadquarter)
}

const DirectorProjects = () => {
  const { user } = useAuth();

  // Mock data
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      name: "Torneo Interbarrial",
      category: "Deportes",
      type: "investment",
      goal: 1500000,
      raised: 1125000,
      progress: 75,
      priority: "high",
      deadline: "15 Ene 2025",
      description:
        "Organización de torneo interbarrial para todas las categorías",
      headquarters_id: 1,
    },
    {
      id: 2,
      name: "Programa Nutrición Infantil",
      category: "Salud",
      type: "investment",
      goal: 3000000,
      raised: 1500000,
      progress: 50,
      priority: "medium",
      deadline: "30 Ene 2025",
      description: "Programa de alimentación balanceada para 120 niños",
      headquarters_id: 3,
    },
    {
      id: 3,
      name: "Mejora Instalaciones",
      category: "Infraestructura",
      type: "investment",
      goal: 5000000,
      raised: 1500000,
      progress: 30,
      priority: "low",
      deadline: "28 Feb 2025",
      description: "Remodelación de instalaciones deportivas en Sede Sur",
      headquarters_id: 2,
    },
  ]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
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
    <div className="min-h-screen pt-20 bg-background">
      {/* Header */}
      <div className="bg-primary py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-foreground mb-2">
                Gestión de Proyectos
              </h1>
              <p className="text-primary-foreground/80">
                Bienvenido, {user?.first_name} {user?.last_name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-6 h-6 text-primary-foreground" />
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {user?.role}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}
                    >
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Proyectos
                </span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={openCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleExportExcel} title="Exportar Excel">
                    <Download className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleExportPDF} title="Exportar PDF">
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="mb-6 space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar por nombre o descripción..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      <SelectItem value="Deportes">Deportes</SelectItem>
                      <SelectItem value="Educación">Educación</SelectItem>
                      <SelectItem value="Salud">Salud</SelectItem>
                      <SelectItem value="Nutrición">Nutrición</SelectItem>
                      <SelectItem value="Infraestructura">
                        Infraestructura
                      </SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las prioridades</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="low">Baja</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      <SelectItem value="investment">Proyecto de Inversión</SelectItem>
                      <SelectItem value="free">Inversión Libre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Table */}
              {filteredProjects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay proyectos que coincidan con los filtros seleccionados
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Prioridad</TableHead>
                        <TableHead>Sede</TableHead>
                        <TableHead>Meta</TableHead>
                        <TableHead>Recaudado</TableHead>
                        <TableHead>Progreso</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProjects.map((project) => (
                        <TableRow
                          key={project.id}
                          className="hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">
                            {project.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {project.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {project.type === "investment"
                              ? "Inversión"
                              : "Libre"}
                          </TableCell>
                          <TableCell>
                            {getPriorityBadge(project.priority)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {getHqName(project.headquarters_id)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatCurrency(project.goal)}
                          </TableCell>
                          <TableCell className="text-sm">
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
                          <TableCell className="text-sm">
                            {project.deadline}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDetailProject(project)}
                              className="h-8 w-8"
                              title="Ver detalle"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEdit(project)}
                              className="h-8 w-8"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => initiateDelete(project)}
                              className="h-8 w-8 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              {editing ? "Editar Proyecto" : "Crear Nuevo Proyecto"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Modifica los detalles del proyecto existente"
                : "Completa la información para crear un nuevo proyecto"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Nombre del Proyecto *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="Ej: Torneo Interbarrial 2025"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) =>
                    setForm({ ...form, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Deportes">Deportes</SelectItem>
                    <SelectItem value="Educación">Educación</SelectItem>
                    <SelectItem value="Salud">Salud</SelectItem>
                    <SelectItem value="Nutrición">Nutrición</SelectItem>
                    <SelectItem value="Infraestructura">
                      Infraestructura
                    </SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Proyecto *</Label>
                <Select
                  value={form.type}
                  onValueChange={(value: ProjectType) =>
                    setForm({ ...form, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="investment">
                      Proyecto de Inversión
                    </SelectItem>
                    <SelectItem value="free">Inversión Libre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad *</Label>
                <Select
                  value={form.priority}
                  onValueChange={(value: ProjectPriority) =>
                    setForm({ ...form, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="low">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <Label htmlFor="deadline">Fecha Límite *</Label>
                <Input
                  id="deadline"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm({ ...form, deadline: e.target.value })
                  }
                  placeholder="15 Ene 2025"
                />
              </div>

              {/* Headquarters (Sede) */}
              <div className="space-y-2">
                <Label htmlFor="headquarters">Sede</Label>
                <Select
                  value={String(form.headquarters_id ?? "")}
                  onValueChange={(value) =>
                    setForm({ ...form, headquarters_id: value ? parseInt(value) : undefined })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona sede" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin sede</SelectItem>
                    <SelectItem value="1">Sede Norte</SelectItem>
                    <SelectItem value="2">Sede Centro</SelectItem>
                    <SelectItem value="3">Sede Sur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Goal */}
              <div className="space-y-2">
                <Label htmlFor="goal">Meta de Financiación (COP) *</Label>
                <Input
                  id="goal"
                  type="number"
                  value={form.goal}
                  onChange={(e) =>
                    setForm({ ...form, goal: parseInt(e.target.value) || 0 })
                  }
                  placeholder="5000000"
                />
              </div>

              {/* Raised */}
              <div className="space-y-2">
                <Label htmlFor="raised">Financiación Actual (COP)</Label>
                <Input
                  id="raised"
                  type="number"
                  value={form.raised}
                  onChange={(e) =>
                    setForm({ ...form, raised: parseInt(e.target.value) || 0 })
                  }
                  placeholder="1500000"
                />
              </div>

              {/* Description */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Descripción del Proyecto</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe los objetivos, alcance y beneficiarios..."
                  rows={4}
                />
              </div>
            </div>

            {/* Progress Preview */}
            {form.goal > 0 && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Progreso Actual
                  </span>
                  <span className="font-semibold">
                    {Math.round((form.raised / form.goal) * 100)}%
                  </span>
                </div>
                <Progress
                  value={(form.raised / form.goal) * 100}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatCurrency(form.raised)}</span>
                  <span>{formatCurrency(form.goal)}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {editing ? "Actualizar" : "Crear"} Proyecto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailProject} onOpenChange={() => setDetailProject(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Detalle del Proyecto
            </DialogTitle>
            <DialogDescription>
              Información detallada del proyecto seleccionado
            </DialogDescription>
          </DialogHeader>
          {detailProject && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{detailProject.name}</h3>
                <Badge variant="secondary" className="text-xs">
                  {getHqName(detailProject.headquarters_id)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {detailProject.description}
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Categoría: </span>
                  {detailProject.category}
                </div>
                <div>
                  <span className="text-muted-foreground">Tipo: </span>
                  {detailProject.type === "investment" ? "Inversión" : "Libre"}
                </div>
                <div>
                  <span className="text-muted-foreground">Sede: </span>
                  {getHqName(detailProject.headquarters_id)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Prioridad: </span>
                  {getPriorityBadge(detailProject.priority)}
                </div>
                <div>
                  <span className="text-muted-foreground">Meta: </span>
                  {formatCurrency(detailProject.goal)}
                </div>
                <div>
                  <span className="text-muted-foreground">Recaudado: </span>
                  {formatCurrency(detailProject.raised)}
                </div>
                <div>
                  <span className="text-muted-foreground">Deadline: </span>
                  {detailProject.deadline}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Progreso: </span>
                  <Progress value={detailProject.progress} className="w-24" />
                  <span className={`text-xs font-medium ${getProgressColor(detailProject.progress)}`}>
                    {detailProject.progress}%
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailProject(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmation
        open={showDeleteConfirm}
        title="Eliminar Proyecto"
        description="¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer."
        targetName={deleteTarget?.name}
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
};

export default DirectorProjects;
