import { useState, useMemo } from "react";
import {
  Users,
  Trophy,
  MapPin,
  TrendingUp,
  Calendar,
  Award,
  UserCheck,
  ClipboardList,
  Target,
  Activity,
  Filter,
  Download,
  Map,
  Clock,
  CheckCircle2,
  Plus,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  generateProjectsExcel,
  generateProjectsPDF,
  generateBeneficiariesExcel,
  generateBeneficiariesPDF,
  type ProjectReport,
  type BeneficiaryReport,
} from '@/lib/reportGenerator';

const DirectorDashboard = () => {
  const { user } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [showCalendarDialog, setShowCalendarDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<
    (typeof upcomingEvents)[0] | null
  >(null);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<{
    id: number;
    name: string;
    progress: number;
    deadline: string;
    priority: "high" | "medium" | "low";
  } | null>(null);
  const [projectForm, setProjectForm] = useState({
    name: "",
    type: "investment" as "investment" | "free",
    category: "",
    goal: 0,
    raised: 0,
    priority: "medium" as "high" | "medium" | "low",
    deadline: "",
    description: "",
  });
  const [showBeneficiaryDialog, setShowBeneficiaryDialog] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<typeof beneficiariesData[0] | null>(null);

  const beneficiariesData = [
    {
      id: 1,
      name: "Miguel Ángel Castro",
      age: 13,
      category: "Categoria 4",
      location: "Sede Norte",
      status: "active",
      performance: 85,
      attendance: 95,
      birthDate: "2011-03-15",
      joinDate: "2022-01-10",
      guardian: "María Castro",
      phone: "315-123-4567",
      address: "Calle 25 #10-45, Cali",
      emergencyContact: "María Castro - 315-123-4567",
      medicalInfo: "Ninguna",
      achievements: [
        { date: "2024-11", title: "MVP Torneo Interbarrial", description: "Mejor jugador del torneo" },
        { date: "2024-09", title: "Certificación Técnica", description: "Nivel avanzado en fundamentos" },
      ],
      evaluations: [
        { date: "2024-12-01", skill: "Técnica", score: 85, notes: "Excelente control de balón" },
        { date: "2024-12-01", skill: "Táctica", score: 80, notes: "Buena lectura del juego" },
        { date: "2024-12-01", skill: "Física", score: 90, notes: "Resistencia sobresaliente" },
      ],
      academicProgress: {
        gpa: 4.2,
        behavior: "Excelente",
        notes: "Estudiante destacado, participativo y responsable",
      },
    },
    {
      id: 2,
      name: "Sofía Morales",
      age: 11,
      category: "Categoria 3",
      location: "Sede Centro",
      status: "active",
      performance: 92,
      attendance: 98,
      birthDate: "2013-07-20",
      joinDate: "2021-08-15",
      guardian: "Pedro Morales",
      phone: "310-987-6543",
      address: "Carrera 15 #30-12, Cali",
      emergencyContact: "Pedro Morales - 310-987-6543",
      medicalInfo: "Alergia a la penicilina",
      achievements: [
        { date: "2024-10", title: "Mejor Asistencia", description: "100% asistencia Q4" },
        { date: "2024-08", title: "Goleadora del Mes", description: "8 goles en agosto" },
      ],
      evaluations: [
        { date: "2024-12-01", skill: "Técnica", score: 95, notes: "Habilidades excepcionales" },
        { date: "2024-12-01", skill: "Táctica", score: 88, notes: "Muy buena visión de juego" },
        { date: "2024-12-01", skill: "Física", score: 92, notes: "Velocidad destacada" },
      ],
      academicProgress: {
        gpa: 4.5,
        behavior: "Sobresaliente",
        notes: "Líder natural, apoya a sus compañeros",
      },
    },
    {
      id: 3,
      name: "Andrés Vargas",
      age: 16,
      category: "Categoria 5",
      location: "Sede Sur",
      status: "active",
      performance: 78,
      attendance: 88,
      birthDate: "2008-11-30",
      joinDate: "2020-03-01",
      guardian: "Ana Vargas",
      phone: "320-456-7890",
      address: "Calle 10 #5-20, Cali",
      emergencyContact: "Ana Vargas - 320-456-7890",
      medicalInfo: "Ninguna",
      achievements: [
        { date: "2024-06", title: "Capitán del Equipo", description: "Seleccionado como capitán Categoria 5" },
      ],
      evaluations: [
        { date: "2024-12-01", skill: "Técnica", score: 78, notes: "En desarrollo, necesita práctica" },
        { date: "2024-12-01", skill: "Táctica", score: 82, notes: "Buen liderazgo en campo" },
        { date: "2024-12-01", skill: "Física", score: 75, notes: "Requiere mejorar resistencia" },
      ],
      academicProgress: {
        gpa: 3.8,
        behavior: "Bueno",
        notes: "Responsable, a veces distraído",
      },
    },
    {
      id: 4,
      name: "Valentina Ruiz",
      age: 13,
      category: "Categoria 4",
      location: "Sede Norte",
      status: "pending",
      performance: 88,
      attendance: 92,
      birthDate: "2011-05-12",
      joinDate: "2023-02-20",
      guardian: "Carlos Ruiz",
      phone: "318-234-5678",
      address: "Carrera 20 #8-15, Cali",
      emergencyContact: "Carlos Ruiz - 318-234-5678",
      medicalInfo: "Ninguna",
      achievements: [
        { date: "2024-09", title: "Reconocimiento Académico", description: "Cuadro de honor escolar" },
      ],
      evaluations: [
        { date: "2024-12-01", skill: "Técnica", score: 90, notes: "Muy técnica, excelente manejo" },
        { date: "2024-12-01", skill: "Táctica", score: 85, notes: "Inteligente en posicionamiento" },
        { date: "2024-12-01", skill: "Física", score: 88, notes: "Buena condición física" },
      ],
      academicProgress: {
        gpa: 4.7,
        behavior: "Excelente",
        notes: "Sobresaliente en todas las áreas",
      },
    },
    {
      id: 5,
      name: "Carlos Mendoza",
      age: 9,
      category: "Categoria 2",
      location: "Sede Centro",
      status: "active",
      performance: 90,
      attendance: 100,
      birthDate: "2015-09-08",
      joinDate: "2023-06-10",
      guardian: "Laura Mendoza",
      phone: "312-678-9012",
      address: "Calle 40 #15-30, Cali",
      emergencyContact: "Laura Mendoza - 312-678-9012",
      medicalInfo: "Asma leve controlada",
      achievements: [
        { date: "2024-11", title: "Asistencia Perfecta", description: "100% asistencia anual" },
        { date: "2024-10", title: "Jugador Promesa", description: "Talento destacado categoría menor" },
      ],
      evaluations: [
        { date: "2024-12-01", skill: "Técnica", score: 92, notes: "Talento natural excepcional" },
        { date: "2024-12-01", skill: "Táctica", score: 88, notes: "Aprende rápidamente" },
        { date: "2024-12-01", skill: "Física", score: 90, notes: "Excelente para su edad" },
      ],
      academicProgress: {
        gpa: 4.3,
        behavior: "Excelente",
        notes: "Niño aplicado y entusiasta",
      },
    },
    {
      id: 6,
      name: "Laura Gómez",
      age: 7,
      category: "Categoria 1",
      location: "Sede Norte",
      status: "active",
      performance: 82,
      attendance: 96,
      birthDate: "2017-02-14",
      joinDate: "2024-01-15",
      guardian: "Sandra Gómez",
      phone: "314-890-1234",
      address: "Calle 5 #12-40, Cali",
      emergencyContact: "Sandra Gómez - 314-890-1234",
      medicalInfo: "Ninguna",
      achievements: [
        { date: "2024-08", title: "Primera Participación", description: "Primer torneo oficial" },
      ],
      evaluations: [
        { date: "2024-12-01", skill: "Técnica", score: 80, notes: "Fundamentos sólidos para principiante" },
        { date: "2024-12-01", skill: "Táctica", score: 78, notes: "Aprendiendo conceptos básicos" },
        { date: "2024-12-01", skill: "Física", score: 88, notes: "Energética y activa" },
      ],
      academicProgress: {
        gpa: 4.1,
        behavior: "Muy bueno",
        notes: "Alegre y participativa",
      },
    },
    {
      id: 7,
      name: "Diego Ramírez",
      age: 15,
      category: "Categoria 5",
      location: "Sede Sur",
      status: "active",
      performance: 87,
      attendance: 90,
      birthDate: "2009-12-05",
      joinDate: "2021-04-20",
      guardian: "Roberto Ramírez",
      phone: "316-345-6789",
      address: "Carrera 8 #20-10, Cali",
      emergencyContact: "Roberto Ramírez - 316-345-6789",
      medicalInfo: "Ninguna",
      achievements: [
        { date: "2024-07", title: "Goleador del Torneo", description: "Máximo anotador Q3" },
        { date: "2024-05", title: "Reconocimiento Deportivo", description: "Mejor deportista del mes" },
      ],
      evaluations: [
        { date: "2024-12-01", skill: "Técnica", score: 85, notes: "Buena técnica de tiro" },
        { date: "2024-12-01", skill: "Táctica", score: 88, notes: "Excelente finalizador" },
        { date: "2024-12-01", skill: "Física", score: 90, notes: "Potencia y velocidad" },
      ],
      academicProgress: {
        gpa: 3.9,
        behavior: "Bueno",
        notes: "Equilibrado entre deporte y estudio",
      },
    },
    {
      id: 8,
      name: "María Torres",
      age: 12,
      category: "Categoria 3",
      location: "Sede Centro",
      status: "inactive",
      performance: 75,
      attendance: 70,
      birthDate: "2012-08-22",
      joinDate: "2022-09-01",
      guardian: "Patricia Torres",
      phone: "319-567-8901",
      address: "Calle 18 #25-05, Cali",
      emergencyContact: "Patricia Torres - 319-567-8901",
      medicalInfo: "Ninguna",
      achievements: [
        { date: "2023-12", title: "Participación Anual", description: "Completó su primer año" },
      ],
      evaluations: [
        { date: "2024-12-01", skill: "Técnica", score: 72, notes: "Necesita práctica adicional" },
        { date: "2024-12-01", skill: "Táctica", score: 75, notes: "Comprensión básica" },
        { date: "2024-12-01", skill: "Física", score: 78, notes: "Condición física regular" },
      ],
      academicProgress: {
        gpa: 3.5,
        behavior: "Regular",
        notes: "Requiere apoyo motivacional",
      },
    },
  ];

  const recentPlayers = beneficiariesData;

  const stats = [
    {
      icon: Trophy,
      title: "Niños Activos",
      value: "243",
      color: "bg-green-500",
    },
    { icon: MapPin, title: "Sedes a Cargo", value: "3", color: "bg-blue-500" },
    {
      icon: ClipboardList,
      title: "Proyectos",
      value: "8",
      color: "bg-purple-500",
    },
    {
      icon: Award,
      title: "Logros del Mes",
      value: "12",
      color: "bg-yellow-500",
    },
  ];

  const locations = [
    {
      id: 1,
      name: "Sede Norte",
      players: 87,
      capacity: 100,
      utilization: 87,
      status: "active",
      address: "Cra 100 #15-20, Cali",
      coordinates: "3.4516, -76.5320",
    },
    {
      id: 2,
      name: "Sede Centro",
      players: 92,
      capacity: 100,
      utilization: 92,
      status: "active",
      address: "Calle 5 #45-12, Cali",
      coordinates: "3.4372, -76.5225",
    },
    {
      id: 3,
      name: "Sede Sur",
      players: 64,
      capacity: 80,
      utilization: 80,
      status: "active",
      address: "Cra 50 #8-35, Cali",
      coordinates: "3.3950, -76.5400",
    },
  ];

  // Filtrar jugadores según ubicación, categoría y estado
  const filteredPlayers = useMemo(() => {
    return recentPlayers.filter((player) => {
      const matchesLocation =
        selectedLocation === "all" || player.location === selectedLocation;
      const matchesCategory =
        selectedCategory === "all" || player.category === selectedCategory;
      const matchesTab = activeTab === "all" || player.status === activeTab;
      return matchesLocation && matchesCategory && matchesTab;
    });
  }, [selectedLocation, selectedCategory, activeTab, recentPlayers]);

  const [projectProgress, setProjectProgress] = useState([
    {
      id: 1,
      name: "Torneo Interbarrial",
      progress: 75,
      deadline: "15 Ene 2025",
      priority: "high" as "high" | "medium" | "low",
      type: "investment" as "investment" | "free",
      category: "Deportes",
      goal: 1500000,
      raised: 1125000,
      description: "Organización de torneo interbarrial para todas las categorías",
    },
    {
      id: 2,
      name: "Programa Nutrición Infantil",
      progress: 50,
      deadline: "30 Ene 2025",
      priority: "medium" as "high" | "medium" | "low",
      type: "investment" as "investment" | "free",
      category: "Salud",
      goal: 3000000,
      raised: 1500000,
      description: "Programa de alimentación balanceada para 120 niños",
    },
    {
      id: 3,
      name: "Mejora Instalaciones",
      progress: 30,
      deadline: "28 Feb 2025",
      priority: "low" as "high" | "medium" | "low",
      type: "investment" as "investment" | "free",
      category: "Infraestructura",
      goal: 5000000,
      raised: 1500000,
      description: "Remodelación de instalaciones deportivas en Sede Sur",
    },
  ]);

  const upcomingEvents = [
    {
      id: 1,
      title: "Entrenamiento Categoria 1 y 2",
      date: "2024-12-12",
      time: "15:00",
      location: "Sede Norte",
      type: "training",
      description:
        "Entrenamiento especial enfocado en técnica de pase y control de balón",
    },
    {
      id: 2,
      title: "Reunión con Padres",
      date: "2024-12-15",
      time: "18:00",
      location: "Sede Centro",
      type: "meeting",
      description:
        "Reunión informativa sobre el torneo interbarrial y avances académicos",
    },
    {
      id: 3,
      title: "Partido Amistoso Categoria 5",
      date: "2024-12-20",
      time: "10:00",
      location: "Sede Sur",
      type: "match",
      description: "Partido amistoso contra Club Deportivo América de Cali",
    },
    {
      id: 4,
      title: "Evaluación Física Categoria 3",
      date: "2024-12-18",
      time: "14:00",
      location: "Sede Centro",
      type: "evaluation",
      description: "Evaluación trimestral de rendimiento físico y técnico",
    },
    {
      id: 5,
      title: "Torneo Municipal Sub-12",
      date: "2024-12-22",
      time: "09:00",
      location: "Estadio Olímpico",
      type: "tournament",
      description: "Participación en el torneo municipal categoría 3",
    },
  ];

  const handleExportReport = () => {
    toast.success("Generando reporte...", {
      description: "El reporte se descargará en unos momentos",
    });
  };

  const handleLocationClick = (locationId: number) => {
    const location = locations.find((loc) => loc.id === locationId);
    if (location) {
      toast.info(`Sede: ${location.name}`, {
        description: `${location.players} niños registrados`,
      });
    }
  };

  const handleViewMap = () => {
    setShowMapDialog(true);
  };

  const handleViewCalendar = () => {
    setShowCalendarDialog(true);
  };

  const handleEventClick = (event: (typeof upcomingEvents)[0]) => {
    setSelectedEvent(event);
    toast.info(event.title, {
      description: `${formatDate(event.date)} a las ${event.time} - ${
        event.location
      }`,
    });
  };

  const handleMarkEventComplete = (eventId: number) => {
    toast.success("Evento marcado como completado", {
      description: "El evento se ha actualizado correctamente",
    });
  };

  // Export handlers
  const handleExportProjectsExcel = () => {
    const reportData: ProjectReport[] = projectProgress.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      goal: p.goal,
      raised: p.raised,
      progress: Math.round((p.raised / p.goal) * 100),
      status: p.progress >= 100 ? 'Completado' : p.progress >= 50 ? 'En Progreso' : 'Inicial',
    }));

    generateProjectsExcel(reportData, 'reporte_proyectos');
    toast.success('Reporte de proyectos generado', {
      description: 'El archivo Excel se ha descargado correctamente',
    });
  };

  const handleExportProjectsPDF = () => {
    const reportData: ProjectReport[] = projectProgress.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      goal: p.goal,
      raised: p.raised,
      progress: Math.round((p.raised / p.goal) * 100),
      status: p.progress >= 100 ? 'Completado' : p.progress >= 50 ? 'En Progreso' : 'Inicial',
    }));

    generateProjectsPDF(reportData, 'reporte_proyectos');
    toast.success('Reporte de proyectos generado', {
      description: 'El archivo PDF se ha descargado correctamente',
    });
  };

  const handleExportBeneficiariesExcel = () => {
    const reportData: BeneficiaryReport[] = beneficiariesData.map(b => ({
      id: b.id,
      name: b.name,
      age: b.age,
      category: b.category,
      location: b.location,
      status: b.status,
    }));

    generateBeneficiariesExcel(reportData, 'reporte_beneficiarios');
    toast.success('Reporte de beneficiarios generado', {
      description: 'El archivo Excel se ha descargado correctamente',
    });
  };

  const handleExportBeneficiariesPDF = () => {
    const reportData: BeneficiaryReport[] = beneficiariesData.map(b => ({
      id: b.id,
      name: b.name,
      age: b.age,
      category: b.category,
      location: b.location,
      status: b.status,
    }));

    generateBeneficiariesPDF(reportData, 'reporte_beneficiarios');
    toast.success('Reporte de beneficiarios generado', {
      description: 'El archivo PDF se ha descargado correctamente',
    });
  };

  // Project CRUD handlers
  const handleCreateProject = () => {
    setEditingProject(null);
    setProjectForm({
      name: "",
      type: "investment",
      category: "",
      goal: 0,
      raised: 0,
      priority: "medium",
      deadline: "",
      description: "",
    });
    setShowProjectDialog(true);
  };

  const handleEditProject = (project: typeof projectProgress[0]) => {
    setEditingProject(project);
    setProjectForm({
      name: project.name,
      type: project.type,
      category: project.category,
      goal: project.goal,
      raised: project.raised,
      priority: project.priority,
      deadline: project.deadline,
      description: project.description,
    });
    setShowProjectDialog(true);
  };

  const handleDeleteProject = (projectId: number) => {
    setProjectProgress(projectProgress.filter((p) => p.id !== projectId));
    toast.success("Proyecto eliminado", {
      description: "El proyecto ha sido eliminado correctamente",
    });
  };

  const handleSaveProject = () => {
    if (!projectForm.name || !projectForm.deadline) {
      toast.error("Campos requeridos", {
        description: "Por favor completa todos los campos obligatorios",
      });
      return;
    }

    if (editingProject) {
      // Update existing project
      setProjectProgress(
        projectProgress.map((p) =>
          p.id === editingProject.id
            ? {
                ...p,
                ...projectForm,
                progress: projectForm.goal > 0 ? Math.round((projectForm.raised / projectForm.goal) * 100) : 0,
              }
            : p
        )
      );
      toast.success("Proyecto actualizado", {
        description: `${projectForm.name} ha sido actualizado correctamente`,
      });
    } else {
      // Create new project
      const newProject = {
        id: Math.max(...projectProgress.map((p) => p.id)) + 1,
        ...projectForm,
        progress: projectForm.goal > 0 ? Math.round((projectForm.raised / projectForm.goal) * 100) : 0,
      };
      setProjectProgress([...projectProgress, newProject]);
      toast.success("Proyecto creado", {
        description: `${projectForm.name} ha sido creado correctamente`,
      });
    }

    setShowProjectDialog(false);
    setEditingProject(null);
  };

  const handleViewBeneficiary = (beneficiary: typeof beneficiariesData[0]) => {
    setSelectedBeneficiary(beneficiary);
    setShowBeneficiaryDialog(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "training":
        return <Activity className="w-4 h-4" />;
      case "meeting":
        return <Users className="w-4 h-4" />;
      case "match":
        return <Trophy className="w-4 h-4" />;
      case "evaluation":
        return <ClipboardList className="w-4 h-4" />;
      case "tournament":
        return <Award className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "training":
        return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "meeting":
        return "bg-purple-500/10 text-purple-600 border-purple-200";
      case "match":
        return "bg-green-500/10 text-green-600 border-green-200";
      case "evaluation":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-200";
      case "tournament":
        return "bg-red-500/10 text-red-600 border-red-200";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

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

  return (
    <div className="min-h-screen pt-20 bg-background">
      {/* Header */}
      <div className="bg-primary py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-foreground mb-2">
                Panel de Director
              </h1>
              <p className="text-primary-foreground/80">
                Bienvenido, {user?.first_name} {user?.last_name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-8 h-8 text-primary-foreground" />
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
                      <stat.icon className="w-6 h-6 text-white" />
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

      {/* Main Content */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Locations & Players */}
            <div className="lg:col-span-2 space-y-6">
              {/* Locations Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Gestión de Sedes
                    </span>
                    <Button size="sm" variant="outline" onClick={handleViewMap}>
                      Ver Mapa
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {locations.map((location) => (
                      <Card
                        key={location.id}
                        className="border-l-4 border-l-primary hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleLocationClick(location.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {location.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {location.players} de {location.capacity} niños
                              </p>
                            </div>
                            <Badge
                              variant={
                                location.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              Activa
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                Utilización
                              </span>
                              <span className="font-medium">
                                {location.utilization}%
                              </span>
                            </div>
                            <Progress value={location.utilization} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Players Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Niños Recientes
                    </span>
                    <Button size="sm" onClick={handleExportReport}>
                      <Download className="w-4 h-4 mr-2" />
                      Exportar
                    </Button>
                  </CardTitle>
                  {/* Filtros */}
                  <div className="flex gap-2 mt-4">
                    <Select
                      value={selectedLocation}
                      onValueChange={setSelectedLocation}
                    >
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
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Todas las categorías" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          Todas las categorías
                        </SelectItem>
                        <SelectItem value="Categoria 1">
                          Categoria 1 (6-8)
                        </SelectItem>
                        <SelectItem value="Categoria 2">
                          Categoria 2 (8-10)
                        </SelectItem>
                        <SelectItem value="Categoria 3">
                          Categoria 3 (10-12)
                        </SelectItem>
                        <SelectItem value="Categoria 4">
                          Categoria 4 (12-15)
                        </SelectItem>
                        <SelectItem value="Categoria 5">
                          Categoria 5 (15-17)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Export Buttons */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportBeneficiariesExcel}>
                      <Download className="w-4 h-4 mr-2" />
                      Excel
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportBeneficiariesPDF}>
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
                      {filteredPlayers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No hay niños que coincidan con los filtros
                          seleccionados
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
                            {filteredPlayers.map((player) => (
                              <TableRow
                                key={player.id}
                                className="hover:bg-muted/50 cursor-pointer"
                                onClick={() => handleViewBeneficiary(player)}
                              >
                                <TableCell className="font-medium">
                                  {player.name}
                                </TableCell>
                                <TableCell>{player.age} años</TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {player.category}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {player.location}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Progress
                                      value={player.performance}
                                      className="w-16"
                                    />
                                    <span
                                      className={`text-sm font-medium ${getPerformanceColor(
                                        player.performance
                                      )}`}
                                    >
                                      {player.performance}%
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={`text-sm font-medium ${getPerformanceColor(
                                      player.attendance
                                    )}`}
                                  >
                                    {player.attendance}%
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(player.status)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Projects & Events */}
            <div className="space-y-6">
              {/* Projects Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Proyectos en Curso
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleExportProjectsExcel}>
                        <Download className="w-3 h-3 mr-1" />
                        Excel
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleExportProjectsPDF}>
                        <Download className="w-3 h-3 mr-1" />
                        PDF
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCreateProject}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projectProgress.map((project) => (
                      <div key={project.id} className="space-y-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-sm font-medium text-foreground">
                              {project.name}
                            </span>
                            <Badge
                              variant={
                                project.priority === "high"
                                  ? "destructive"
                                  : project.priority === "medium"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {project.priority === "high"
                                ? "Alta"
                                : project.priority === "medium"
                                ? "Media"
                                : "Baja"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {project.type === "investment" ? "Inversión" : "Libre"}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8"
                              onClick={() => handleEditProject(project)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8"
                              onClick={() => handleDeleteProject(project.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{project.category}</span>
                            <span>{formatCurrency(project.raised)} / {formatCurrency(project.goal)}</span>
                          </div>
                          <Progress value={project.progress} />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{project.progress}% completado</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {project.deadline}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Ver Reportes
                  </Button>
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Próximos Eventos
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleViewCalendar}
                    >
                      <Calendar className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={`border-l-4 border-l-primary pl-4 py-3 hover:bg-muted/50 transition-colors rounded-r cursor-pointer ${getEventColor(
                          event.type
                        )} border`}
                        onClick={() => handleEventClick(event)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {getEventIcon(event.type)}
                              <h4 className="font-medium text-sm">
                                {event.title}
                              </h4>
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(event.date)}</span>
                              <span>•</span>
                              <Clock className="w-3 h-3" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkEventComplete(event.id);
                            }}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full mt-4"
                    variant="outline"
                    onClick={handleViewCalendar}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Ver Calendario Completo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Dialog */}
      <Dialog open={showMapDialog} onOpenChange={setShowMapDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Map className="w-5 h-5" />
              Mapa de Sedes
            </DialogTitle>
            <DialogDescription>
              Ubicación de todas las sedes de la fundación
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d254508.39253748488!2d-76.67419364999999!3d3.4372!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e30a6f0cc4bb3f1%3A0x1f0fb5e952ae6168!2sCali%2C%20Valle%20del%20Cauca!5e0!3m2!1ses!2sco!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {locations.map((location) => (
                <Card
                  key={location.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm">
                          {location.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {location.address}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {location.players} niños
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {location.utilization}% capacidad
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Calendar Dialog */}
      <Dialog open={showCalendarDialog} onOpenChange={setShowCalendarDialog}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Calendario de Eventos
            </DialogTitle>
            <DialogDescription>
              Todos los eventos programados para el mes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <Card
                key={event.id}
                className={`${getEventColor(event.type)} border-l-4`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getEventIcon(event.type)}
                        <h3 className="font-semibold">{event.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {event.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleMarkEventComplete(event.id)}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Project CRUD Dialog */}
      <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              {editingProject ? "Editar Proyecto" : "Crear Nuevo Proyecto"}
            </DialogTitle>
            <DialogDescription>
              {editingProject 
                ? "Modifica los detalles del proyecto existente" 
                : "Completa la información para crear un nuevo proyecto de inversión"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Nombre del Proyecto *</Label>
                <Input
                  id="name"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  placeholder="Ej: Torneo Interbarrial 2025"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Proyecto *</Label>
                <Select
                  value={projectForm.type}
                  onValueChange={(value: "investment" | "free") =>
                    setProjectForm({ ...projectForm, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="investment">Proyecto de Inversión</SelectItem>
                    <SelectItem value="free">Inversión Libre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={projectForm.category}
                  onValueChange={(value) => setProjectForm({ ...projectForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Deportes">Deportes</SelectItem>
                    <SelectItem value="Educación">Educación</SelectItem>
                    <SelectItem value="Salud">Salud</SelectItem>
                    <SelectItem value="Nutrición">Nutrición</SelectItem>
                    <SelectItem value="Infraestructura">Infraestructura</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">Meta de Financiación (COP) *</Label>
                <Input
                  id="goal"
                  type="number"
                  value={projectForm.goal}
                  onChange={(e) => setProjectForm({ ...projectForm, goal: parseInt(e.target.value) || 0 })}
                  placeholder="5000000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="raised">Financiación Actual (COP)</Label>
                <Input
                  id="raised"
                  type="number"
                  value={projectForm.raised}
                  onChange={(e) => setProjectForm({ ...projectForm, raised: parseInt(e.target.value) || 0 })}
                  placeholder="1500000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad *</Label>
                <Select
                  value={projectForm.priority}
                  onValueChange={(value: "high" | "medium" | "low") =>
                    setProjectForm({ ...projectForm, priority: value })
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

              <div className="space-y-2">
                <Label htmlFor="deadline">Fecha Límite *</Label>
                <Input
                  id="deadline"
                  value={projectForm.deadline}
                  onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
                  placeholder="15 Ene 2025"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Descripción del Proyecto</Label>
                <Textarea
                  id="description"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Describe los objetivos, alcance y beneficiarios del proyecto..."
                  rows={4}
                />
              </div>
            </div>

            {projectForm.goal > 0 && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progreso Actual</span>
                  <span className="font-semibold">
                    {Math.round((projectForm.raised / projectForm.goal) * 100)}%
                  </span>
                </div>
                <Progress value={(projectForm.raised / projectForm.goal) * 100} />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatCurrency(projectForm.raised)}</span>
                  <span>{formatCurrency(projectForm.goal)}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProjectDialog(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSaveProject}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {editingProject ? "Actualizar" : "Crear"} Proyecto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Beneficiary Detail Dialog */}
      <Dialog open={showBeneficiaryDialog} onOpenChange={setShowBeneficiaryDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Ficha Técnica de Beneficiario
            </DialogTitle>
            <DialogDescription>
              Información detallada y trayectoria del beneficiario
            </DialogDescription>
          </DialogHeader>
          {selectedBeneficiary && (
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información Personal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Nombre Completo</div>
                      <div className="font-semibold">{selectedBeneficiary.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Edad</div>
                      <div className="font-semibold">{selectedBeneficiary.age} años</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Categoría</div>
                      <Badge variant="outline">{selectedBeneficiary.category}</Badge>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Sede</div>
                      <div className="font-semibold">{selectedBeneficiary.location}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Fecha Nacimiento</div>
                      <div className="font-semibold">{selectedBeneficiary.birthDate}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Fecha Ingreso</div>
                      <div className="font-semibold">{selectedBeneficiary.joinDate}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Acudiente</div>
                      <div className="font-semibold">{selectedBeneficiary.guardian}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Teléfono</div>
                      <div className="font-semibold">{selectedBeneficiary.phone}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Estado</div>
                      {getStatusBadge(selectedBeneficiary.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-2">Rendimiento Deportivo</div>
                      <div className="text-4xl font-bold text-primary mb-2">
                        {selectedBeneficiary.performance}%
                      </div>
                      <Progress value={selectedBeneficiary.performance} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-2">Asistencia</div>
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        {selectedBeneficiary.attendance}%
                      </div>
                      <Progress value={selectedBeneficiary.attendance} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Evaluations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Evaluaciones Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedBeneficiary.evaluations.map((evaluation: typeof selectedBeneficiary.evaluations[0], idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex-1">
                          <div className="font-semibold">{evaluation.skill}</div>
                          <div className="text-sm text-muted-foreground">{evaluation.notes}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={evaluation.score} className="w-24" />
                          <span className="font-bold text-lg w-12 text-right">{evaluation.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Logros y Reconocimientos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedBeneficiary.achievements.map((achievement: typeof selectedBeneficiary.achievements[0], idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                        <Award className="w-5 h-5 text-yellow-500 mt-1" />
                        <div className="flex-1">
                          <div className="font-semibold">{achievement.title}</div>
                          <div className="text-sm text-muted-foreground">{achievement.description}</div>
                          <div className="text-xs text-muted-foreground mt-1">{achievement.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Academic Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Progreso Académico</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Promedio</div>
                      <div className="text-2xl font-bold">{selectedBeneficiary.academicProgress.gpa}</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Comportamiento</div>
                      <div className="text-lg font-semibold">{selectedBeneficiary.academicProgress.behavior}</div>
                    </div>
                    <div className="col-span-3 md:col-span-1 p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Notas</div>
                      <div className="text-sm">{selectedBeneficiary.academicProgress.notes}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información de Contacto y Médica</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Dirección</div>
                      <div className="font-medium">{selectedBeneficiary.address}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Contacto de Emergencia</div>
                      <div className="font-medium">{selectedBeneficiary.emergencyContact}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm text-muted-foreground">Información Médica</div>
                      <div className="font-medium">{selectedBeneficiary.medicalInfo}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DirectorDashboard;
