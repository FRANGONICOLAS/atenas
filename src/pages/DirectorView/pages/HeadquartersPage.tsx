import { useState, useMemo, useRef, useEffect } from "react";
import { useDirectorView } from "@/hooks/useDirectorView";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import DeleteConfirmation from "@/components/modals/DeleteConfirmation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { MapPin, Building2, Plus, Edit, Trash2, Search } from "lucide-react";
import type { Headquarter, HeadquarterStatus } from "@/types";

const mockHeadquarters: Headquarter[] = [
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

// Custom Leaflet marker icon - blue teardrop style
const createCustomMarkerIcon = () => {
  return L.divIcon({
    html: `<svg width='32' height='40' viewBox='0 0 32 40' xmlns='http://www.w3.org/2000/svg' style='filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2))'>
      <path d='M16 0C7.73 0 1 6.73 1 15c0 10 15 25 15 25s15-15 15-25c0-8.27-6.73-15-15-15z' fill='#3b82f6' stroke='white' stroke-width='1'/>
      <circle cx='16' cy='15' r='5' fill='white'/>
    </svg>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
    className: "custom-marker",
  });
};

const defaultForm: Omit<Headquarter, "id" | "utilization"> = {
  name: "",
  players: 0,
  capacity: 0,
  status: "active",
  address: "",
  coordinates: "",
};

const computeUtilization = (players: number, capacity: number) => {
  if (!capacity || capacity <= 0) return 0;
  return Math.min(100, Math.round((players / capacity) * 100));
};

const HeadquartersPage = () => {
  const {
    headquarters,
    setHeadquarters,
    headquarterSearch: search,
    setHeadquarterSearch: setSearch,
    headquarterStatusFilter: statusFilter,
    setHeadquarterStatusFilter: setStatusFilter,
  } = useDirectorView();

  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Headquarter | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteTarget, setDeleteTarget] = useState<Headquarter | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Initialize map and add markers
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Calculate center and bounds from coordinates
    const coordinates = headquarters
      .map((hq) => {
        const [latStr, lngStr] = hq.coordinates.split(",");
        return {
          lat: parseFloat(latStr.trim()),
          lng: parseFloat(lngStr.trim()),
          name: hq.name,
          address: hq.address,
          players: hq.players,
          capacity: hq.capacity,
        };
      })
      .filter((c) => !isNaN(c.lat) && !isNaN(c.lng));

    if (coordinates.length === 0) return;

    // Create map
    const map = L.map(mapRef.current).setView([coordinates[0].lat, coordinates[0].lng], 13);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add markers
    const markerGroup = L.featureGroup();
    coordinates.forEach((coord) => {
      const marker = L.marker([coord.lat, coord.lng], {
        icon: createCustomMarkerIcon(),
      }).bindPopup(
        `<div class="text-sm"><strong>${coord.name}</strong><br/>${coord.address}<br/>Niños: ${coord.players}/${coord.capacity}</div>`
      );
      markerGroup.addLayer(marker);
    });

    markerGroup.addTo(map);

    // Fit bounds
    if (coordinates.length > 1) {
      map.fitBounds(markerGroup.getBounds(), { padding: [50, 50] });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [headquarters]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return headquarters.filter((hq) => {
      const matchesTerm =
        hq.name.toLowerCase().includes(term) ||
        hq.address.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || hq.status === statusFilter;
      return matchesTerm && matchesStatus;
    });
  }, [headquarters, search, statusFilter]);

  const stats = useMemo(() => {
    const total = headquarters.length;
    const active = headquarters.filter((h) => h.status === "active").length;
    const capacity = headquarters.reduce((sum, h) => sum + h.capacity, 0);
    const players = headquarters.reduce((sum, h) => sum + h.players, 0);
    return { total, active, capacity, players };
  }, [headquarters]);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setShowDialog(true);
  };

  const openEdit = (hq: Headquarter) => {
    setEditing(hq);
    setForm({
      name: hq.name,
      players: hq.players,
      capacity: hq.capacity,
      status: hq.status,
      address: hq.address,
      coordinates: hq.coordinates,
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!form.name || !form.capacity) {
      toast.error("Campos requeridos", {
        description: "Nombre y capacidad son obligatorios",
      });
      return;
    }

    const utilization = computeUtilization(form.players, form.capacity);

    if (editing) {
      setHeadquarters((prev) =>
        prev.map((h) =>
          h.id === editing.id
            ? {
                ...h,
                ...form,
                utilization,
              }
            : h
        )
      );
      toast.success("Sede actualizada", {
        description: `${form.name} guardada correctamente`,
      });
    } else {
      const nextId = Math.max(...headquarters.map((h) => h.id), 0) + 1;
      setHeadquarters((prev) => [
        ...prev,
        {
          id: nextId,
          ...form,
          utilization,
        },
      ]);
      toast.success("Sede creada", {
        description: `${form.name} agregada correctamente`,
      });
    }

    setShowDialog(false);
    setEditing(null);
  };

  const handleDelete = (id: number) => {
    setHeadquarters((prev) => prev.filter((h) => h.id !== id));
    setDeleteTarget(null);
    toast.success("Sede eliminada", {
      description: "Se ha eliminado la sede",
    });
  };

  const toggleStatus = (id: number, nextStatus: HeadquarterStatus) => {
    setHeadquarters((prev) =>
      prev.map((h) => (h.id === id ? { ...h, status: nextStatus } : h))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Sedes</h2>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Nueva Sede
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total de Sedes</div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Sedes Activas</div>
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Capacidad Total</div>
            <div className="text-3xl font-bold">{stats.capacity}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Niños Registrados</div>
            <div className="text-3xl font-bold">{stats.players}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nombre o dirección"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activas</SelectItem>
            <SelectItem value="inactive">Inactivas</SelectItem>
            <SelectItem value="maintenance">Mantenimiento</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Sedes Registradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Capacidad</TableHead>
                <TableHead>Niños</TableHead>
                <TableHead>Utilización</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                    No hay sedes que coincidan con el filtro
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((hq) => (
                  <TableRow key={hq.id}>
                    <TableCell className="font-medium">{hq.name}</TableCell>
                    <TableCell>{hq.address}</TableCell>
                    <TableCell>{hq.capacity}</TableCell>
                    <TableCell>{hq.players}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-semibold">{hq.utilization}%</div>
                        <Progress value={hq.utilization} />
                      </div>
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
                      <Button size="icon" variant="ghost" onClick={() => openEdit(hq)}>
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
                          toggleStatus(
                            hq.id,
                            hq.status === "active" ? "inactive" : "active"
                          )
                        }
                      >
                        {hq.status === "active" ? "Desactivar" : "Activar"}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteTarget(hq)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Map with all headquarters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Mapa de Sedes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            ref={mapRef}
            className="rounded-xl overflow-hidden border border-border shadow-sm"
            style={{ height: 420, width: "100%", position: "relative", zIndex: 0 }}
          ></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {headquarters.map((hq) => (
              <div key={hq.id} className="p-3 rounded-lg border bg-muted/40 hover:shadow-md transition-shadow">
                <div className="font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  {hq.name}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{hq.address}</div>
                <div className="text-xs text-muted-foreground mt-2">Niños: {hq.players}/{hq.capacity}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {editing ? "Editar Sede" : "Nueva Sede"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Actualiza la información de la sede"
                : "Completa los datos para registrar una nueva sede"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Sede Norte"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado *</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as HeadquarterStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activa</SelectItem>
                    <SelectItem value="inactive">Inactiva</SelectItem>
                    <SelectItem value="maintenance">Mantenimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacidad *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={form.capacity}
                  onChange={(e) =>
                    setForm({ ...form, capacity: parseInt(e.target.value) || 0 })
                  }
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="players">Niños registrados</Label>
                <Input
                  id="players"
                  type="number"
                  value={form.players}
                  onChange={(e) =>
                    setForm({ ...form, players: parseInt(e.target.value) || 0 })
                  }
                  placeholder="80"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Dirección *</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Cra 100 #15-20, Cali"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="coordinates">Coordenadas (lat, lng)</Label>
                <Input
                  id="coordinates"
                  value={form.coordinates}
                  onChange={(e) => setForm({ ...form, coordinates: e.target.value })}
                  placeholder="3.4516, -76.5320"
                />
                <p className="text-xs text-muted-foreground">
                  Solo referencial para el mapa. Puedes dejarlo vacío.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmation
        open={Boolean(deleteTarget)}
        targetName={deleteTarget?.name}
        description="Esta acción no se puede deshacer. Se eliminará la sede seleccionada."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
      />
    </div>
  );
};

export default HeadquartersPage;
