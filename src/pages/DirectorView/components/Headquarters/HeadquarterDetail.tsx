import {
  Building2, MapPinned, Users, UserCheck, Calendar,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Headquarter } from "@/types";
import type { Project } from "@/types/project.types";

interface HeadquarterDetailProps {
  headquarter: Headquarter | null;
  beneficiariesStats?: { total: number; active: number };
  projects?: Project[];
  onClose: () => void;
}

export const HeadquarterDetail = ({
  headquarter, beneficiariesStats, projects, onClose,
}: HeadquarterDetailProps) => {
  if (!headquarter) return null;

  return (
    <Dialog open={!!headquarter} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            {headquarter.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {headquarter.image_url && (
            <div className="w-full h-48 rounded-lg overflow-hidden border">
              <img src={headquarter.image_url} alt={headquarter.name} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Badge variant={headquarter.status === "active" ? "default" : headquarter.status === "maintenance" ? "secondary" : "outline"}>
              {headquarter.status === "active" ? "Activa" : headquarter.status === "maintenance" ? "Mantenimiento" : "Inactiva"}
            </Badge>
            {headquarter.created_at && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(headquarter.created_at).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            )}
          </div>

          {beneficiariesStats && (
            <div className="grid grid-cols-2 gap-3">
              <Card><CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg"><Users className="w-5 h-5 text-blue-600" /></div>
                  <div><p className="text-sm text-muted-foreground">Jugadores</p><p className="text-2xl font-bold">{beneficiariesStats.total}</p></div>
                </div>
              </CardContent></Card>
              <Card><CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg"><UserCheck className="w-5 h-5 text-green-600" /></div>
                  <div><p className="text-sm text-muted-foreground">Activos</p><p className="text-2xl font-bold">{beneficiariesStats.active}</p></div>
                </div>
              </CardContent></Card>
            </div>
          )}

          {headquarter.address && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPinned className="w-4 h-4 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Dirección</p>
                <p>{headquarter.address}{headquarter.city ? `, ${headquarter.city}` : ""}</p>
              </div>
            </div>
          )}

          {projects && projects.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-3">Proyectos Asociados</h4>
                <div className="space-y-2">
                  {projects.map((project) => (
                    <div key={project.project_id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{project.name}</h4>
                          {project.description && <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>}
                        </div>
                        <Badge variant={project.status === "active" ? "default" : "secondary"}>
                          {project.status === "active" ? "Activo" : project.status === "completed" ? "Completado" : project.status === "pending" ? "Pendiente" : project.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
