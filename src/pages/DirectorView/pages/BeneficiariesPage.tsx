import { useMemo, useState } from "react";
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
import DeleteConfirmation from "@/components/modals/DeleteConfirmation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  UserCheck,
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  MapPin,
  Activity,
  Phone,
  Home,
  Calendar,
} from "lucide-react";
import {
  generateBeneficiariesExcel,
  generateBeneficiariesPDF,
} from "@/lib/reportGenerator";
import type { Beneficiary, BeneficiaryReport } from "@/types";

const initialBeneficiaries: Beneficiary[] = [
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
      {
        date: "2024-11",
        title: "MVP Torneo Interbarrial",
        description: "Mejor jugador del torneo",
      },
      {
        date: "2024-09",
        title: "Certificación Técnica",
        description: "Nivel avanzado en fundamentos",
      },
    ],
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
      {
        date: "2024-10",
        title: "Mejor Asistencia",
        description: "100% asistencia Q4",
      },
      {
        date: "2024-08",
        title: "Goleadora del Mes",
        description: "8 goles en agosto",
      },
    ],
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
      {
        date: "2024-06",
        title: "Capitán del Equipo",
        description: "Seleccionado como capitán Categoria 5",
      },
    ],
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
      {
        date: "2024-09",
        title: "Reconocimiento Académico",
        description: "Cuadro de honor escolar",
      },
    ],
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
      {
        date: "2024-11",
        title: "Asistencia Perfecta",
        description: "100% asistencia anual",
      },
      {
        date: "2024-10",
        title: "Jugador Promesa",
        description: "Talento destacado categoría menor",
      },
    ],
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
      {
        date: "2024-08",
        title: "Primera Participación",
        description: "Primer torneo oficial",
      },
    ],
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
      {
        date: "2024-07",
        title: "Goleador del Torneo",
        description: "Máximo anotador Q3",
      },
      {
        date: "2024-05",
        title: "Reconocimiento Deportivo",
        description: "Mejor deportista del mes",
      },
    ],
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
      {
        date: "2023-12",
        title: "Participación Anual",
        description: "Completó su primer año",
      },
    ],
  },
];

const BeneficiariesPage = () => {
  const { user } = useAuth();
  const {
    beneficiaries,
    setBeneficiaries,
    beneficiarySearch: search,
    setBeneficiarySearch: setSearch,
    locationFilter,
    setLocationFilter,
    categoryBeneficiaryFilter: categoryFilter,
    setCategoryBeneficiaryFilter: setCategoryFilter,
    statusFilter: statusTab,
    setStatusFilter: setStatusTab,
  } = useDirectorView();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Beneficiary | null>(null);
  const [detail, setDetail] = useState<Beneficiary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Beneficiary | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  const [form, setForm] = useState({
    name: "",
    age: 0,
    category: "",
    location: "",
    status: "active" as Beneficiary["status"],
    performance: 0,
    attendance: 0,
    birthDate: "",
    joinDate: "",
    guardian: "",
    phone: "",
    address: "",
    emergencyContact: "",
    medicalInfo: "",
  });

  const filteredBeneficiaries = useMemo(() => {
    return beneficiaries.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.guardian.toLowerCase().includes(search.toLowerCase());
      const matchesLocation =
        locationFilter === "all" || b.location === locationFilter;
      const matchesCategory =
        categoryFilter === "all" || b.category === categoryFilter;
      const matchesStatus = statusTab === "all" || b.status === statusTab;
      return matchesSearch && matchesLocation && matchesCategory && matchesStatus;
    });
  }, [beneficiaries, search, locationFilter, categoryFilter, statusTab]);

  const getStatusBadge = (status: Beneficiary["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Activo</Badge>;
      case "pending":
        return <Badge variant="secondary">Pendiente</Badge>;
      case "inactive":
        return <Badge variant="outline">Inactivo</Badge>;
    }
  };

  const getPerformanceColor = (value: number) => {
    if (value >= 90) return "text-green-600";
    if (value >= 75) return "text-blue-600";
    if (value >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      age: 0,
      category: "",
      location: "",
      status: "active",
      performance: 0,
      attendance: 0,
      birthDate: "",
      joinDate: "",
      guardian: "",
      phone: "",
      address: "",
      emergencyContact: "",
      medicalInfo: "",
    });
    setShowForm(true);
  };

  const openEdit = (beneficiary: Beneficiary) => {
    setEditing(beneficiary);
    setForm({ ...beneficiary });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name || !form.category || !form.location) {
      toast.error("Campos requeridos", {
        description: "Nombre, categoría y sede son obligatorios",
      });
      return;
    }

    if (editing) {
      setBeneficiaries(
        beneficiaries.map((b) => (b.id === editing.id ? { ...form, id: b.id } : b))
      );
      toast.success("Beneficiario actualizado", {
        description: `${form.name} ha sido actualizado correctamente`,
      });
    } else {
      const newBeneficiary: Beneficiary = {
        ...form,
        id: Math.max(...beneficiaries.map((b) => b.id), 0) + 1,
      };
      setBeneficiaries([...beneficiaries, newBeneficiary]);
      toast.success("Beneficiario creado", {
        description: `${form.name} ha sido agregado correctamente`,
      });
    }

    setShowForm(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setBeneficiaries(beneficiaries.filter((b) => b.id !== deleteTarget.id));
    toast.success("Beneficiario eliminado", {
      description: `${deleteTarget.name} ha sido eliminado`,
    });
    setDeleteTarget(null);
    setShowDelete(false);
  };

  const mapToReport = (items: Beneficiary[]): BeneficiaryReport[] =>
    items.map((b) => ({
      id: b.id,
      name: b.name,
      age: b.age,
      category: b.category,
      location: b.location,
      status: b.status,
    }));

  const sedeStats = useMemo(() => {
    const sedeNames = ["Sede Norte", "Sede Centro", "Sede Sur"];
    return sedeNames.map((name) => {
      const list = beneficiaries.filter((b) => b.location === name);
      const active = list.filter((b) => b.status === "active").length;
      const avgPerf = list.length
        ? Math.round(
            list.reduce((sum, b) => sum + b.performance, 0) / list.length
          )
        : 0;
      return { name, total: list.length, active, avgPerf };
    });
  }, [beneficiaries]);

  const handleExportExcel = () => {
    const data = mapToReport(filteredBeneficiaries);
    generateBeneficiariesExcel(data, "beneficiarios");
    toast.success("Reporte Excel generado", {
      description: `Se exportaron ${data.length} beneficiarios`,
    });
  };

  const handleExportPDF = () => {
    const data = mapToReport(filteredBeneficiaries);
    generateBeneficiariesPDF(data, "beneficiarios");
    toast.success("Reporte PDF generado", {
      description: `Se exportaron ${data.length} beneficiarios`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Beneficiarios</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Stats by Sede */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sedeStats.map((stat) => (
          <Card key={stat.name} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    {stat.name}
                  </span>
                </div>
                <Badge variant="secondary">{stat.total} totales</Badge>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Activos</span>
                <span className="font-semibold text-foreground">{stat.active}</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Rendimiento promedio</span>
                  <span className="font-semibold text-foreground">{stat.avgPerf}%</span>
                </div>
                <Progress value={stat.avgPerf} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Beneficiarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por nombre o acudiente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={locationFilter} onValueChange={setLocationFilter}>
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
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="Categoria 1">Categoria 1 (6-8)</SelectItem>
                  <SelectItem value="Categoria 2">Categoria 2 (8-10)</SelectItem>
                  <SelectItem value="Categoria 3">Categoria 3 (10-12)</SelectItem>
                  <SelectItem value="Categoria 4">Categoria 4 (12-15)</SelectItem>
                  <SelectItem value="Categoria 5">Categoria 5 (15-17)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs value={statusTab} onValueChange={setStatusTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="active">Activos</TabsTrigger>
                <TabsTrigger value="pending">Pendientes</TabsTrigger>
                <TabsTrigger value="inactive">Inactivos</TabsTrigger>
              </TabsList>
              <TabsContent value={statusTab} className="mt-4">
                {filteredBeneficiaries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay beneficiarios que coincidan con los filtros
                  </div>
                ) : (
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
                        {filteredBeneficiaries.map((b) => (
                          <TableRow key={b.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{b.name}</TableCell>
                            <TableCell>{b.age} años</TableCell>
                            <TableCell>
                              <Badge variant="outline">{b.category}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {b.location}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={b.performance} className="w-16" />
                                <span
                                  className={`text-sm font-medium ${getPerformanceColor(
                                    b.performance
                                  )}`}
                                >
                                  {b.performance}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`text-sm font-medium ${getPerformanceColor(
                                  b.attendance
                                )}`}
                              >
                                {b.attendance}%
                              </span>
                            </TableCell>
                            <TableCell>{getStatusBadge(b.status)}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => setDetail(b)}
                                title="Ver detalle"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => openEdit(b)}
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 hover:text-red-600"
                                onClick={() => {
                                  setDeleteTarget(b);
                                  setShowDelete(true);
                                }}
                                title="Eliminar"
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
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              {editing ? "Editar Beneficiario" : "Agregar Beneficiario"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Actualiza la información del beneficiario"
                : "Completa los datos para registrar un beneficiario"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nombre completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Edad *</Label>
                <Input
                  id="age"
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: parseInt(e.target.value) || 0 })}
                  placeholder="12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm({ ...form, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Categoria 1">Categoria 1 (6-8)</SelectItem>
                    <SelectItem value="Categoria 2">Categoria 2 (8-10)</SelectItem>
                    <SelectItem value="Categoria 3">Categoria 3 (10-12)</SelectItem>
                    <SelectItem value="Categoria 4">Categoria 4 (12-15)</SelectItem>
                    <SelectItem value="Categoria 5">Categoria 5 (15-17)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Sede *</Label>
                <Select
                  value={form.location}
                  onValueChange={(value) => setForm({ ...form, location: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona sede" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sede Norte">Sede Norte</SelectItem>
                    <SelectItem value="Sede Centro">Sede Centro</SelectItem>
                    <SelectItem value="Sede Sur">Sede Sur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado *</Label>
                <Select
                  value={form.status}
                  onValueChange={(value: Beneficiary["status"]) =>
                    setForm({ ...form, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="performance">Rendimiento (%)</Label>
                <Input
                  id="performance"
                  type="number"
                  value={form.performance}
                  onChange={(e) =>
                    setForm({ ...form, performance: parseInt(e.target.value) || 0 })
                  }
                  placeholder="85"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendance">Asistencia (%)</Label>
                <Input
                  id="attendance"
                  type="number"
                  value={form.attendance}
                  onChange={(e) =>
                    setForm({ ...form, attendance: parseInt(e.target.value) || 0 })
                  }
                  placeholder="95"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                <Input
                  id="birthDate"
                  value={form.birthDate}
                  onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                  placeholder="2011-03-15"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="joinDate">Fecha de Ingreso</Label>
                <Input
                  id="joinDate"
                  value={form.joinDate}
                  onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
                  placeholder="2022-01-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guardian">Acudiente</Label>
                <Input
                  id="guardian"
                  value={form.guardian}
                  onChange={(e) => setForm({ ...form, guardian: e.target.value })}
                  placeholder="Nombre del acudiente"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="300-000-0000"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Dirección del beneficiario"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
                <Input
                  id="emergencyContact"
                  value={form.emergencyContact}
                  onChange={(e) =>
                    setForm({ ...form, emergencyContact: e.target.value })
                  }
                  placeholder="Nombre y teléfono del contacto"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="medicalInfo">Información Médica</Label>
                <Input
                  id="medicalInfo"
                  value={form.medicalInfo}
                  onChange={(e) => setForm({ ...form, medicalInfo: e.target.value })}
                  placeholder="Alergias o condiciones relevantes"
                />
              </div>
            </div>
            {(form.performance > 0 || form.attendance > 0) && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Rendimiento</div>
                  <Progress value={form.performance} />
                  <div className="text-xs mt-1">{form.performance}%</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Asistencia</div>
                  <Progress value={form.attendance} />
                  <div className="text-xs mt-1">{form.attendance}%</div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editing ? "Actualizar" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Ficha del Beneficiario
            </DialogTitle>
            <DialogDescription>
              Información detallada y trayectoria del beneficiario
            </DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-6 py-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información Personal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Nombre</div>
                      <div className="font-semibold">{detail.name}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Edad</div>
                      <div className="font-semibold">{detail.age} años</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Categoría</div>
                      <Badge variant="outline">{detail.category}</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-muted-foreground">Sede</div>
                        <div className="font-semibold">{detail.location}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Estado</div>
                      {getStatusBadge(detail.status)}
                    </div>
                    <div>
                      <div className="text-muted-foreground">Nacimiento</div>
                      <div className="font-semibold">{detail.birthDate}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Ingreso</div>
                      <div className="font-semibold">{detail.joinDate}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-muted-foreground">Acudiente</div>
                        <div className="font-semibold">{detail.guardian}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Teléfono</div>
                      <div className="font-semibold">{detail.phone}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Activity className="w-4 h-4" /> Rendimiento Deportivo
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={detail.performance} className="w-32" />
                        <span
                          className={`text-sm font-semibold ${getPerformanceColor(
                            detail.performance
                          )}`}
                        >
                          {detail.performance}%
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" /> Asistencia
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={detail.attendance} className="w-32" />
                        <span
                          className={`text-sm font-semibold ${getPerformanceColor(
                            detail.attendance
                          )}`}
                        >
                          {detail.attendance}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                    <div className="flex items-start gap-2">
                      <Home className="w-4 h-4 text-muted-foreground mt-1" />
                      <div>
                        <div className="text-muted-foreground">Dirección</div>
                        <div className="font-medium">{detail.address}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Contacto de Emergencia</div>
                      <div className="font-medium">{detail.emergencyContact}</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-muted-foreground text-sm">Información Médica</div>
                    <div className="font-medium">{detail.medicalInfo}</div>
                  </div>
                </CardContent>
              </Card>

              {detail.achievements && detail.achievements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Logros y Reconocimientos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {detail.achievements.map((a, idx) => (
                      <div key={idx} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <div className="font-semibold">{a.title}</div>
                          <span className="text-muted-foreground text-xs">{a.date}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">{a.description}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetail(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmation
        open={showDelete}
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDelete(false);
          setDeleteTarget(null);
        }}
        title="¿Eliminar beneficiario?"
        description={
          deleteTarget
            ? `Estás a punto de eliminar "${deleteTarget.name}". Esta acción no se puede deshacer.`
            : "Esta acción no se puede deshacer."
        }
      />
    </div>
  );
};

export default BeneficiariesPage;
