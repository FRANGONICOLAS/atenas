import {
  Building2,
  MapPinned,
  Phone,
  Mail,
  User,
  Users,
  UserCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Headquarter } from "@/types";

interface HeadquarterDetailProps {
  headquarter: Headquarter | null;
  beneficiariesStats?: { total: number; active: number };
  onClose: () => void;
}

export const HeadquarterDetail = ({
  headquarter,
  beneficiariesStats,
  onClose,
}: HeadquarterDetailProps) => {
  if (!headquarter) return null;

  return (
    <Dialog open={!!headquarter} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Información de la Sede
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Imagen */}
          {headquarter.image_url && (
            <div className="w-full h-48 rounded-lg overflow-hidden border">
              <img
                src={headquarter.image_url}
                alt={headquarter.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Información principal */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">{headquarter.name}</h3>
              <Badge
                variant={
                  headquarter.status === "active"
                    ? "default"
                    : headquarter.status === "maintenance"
                      ? "secondary"
                      : "outline"
                }
              >
                {headquarter.status === "active"
                  ? "Activa"
                  : headquarter.status === "maintenance"
                    ? "Mantenimiento"
                    : "Inactiva"}
              </Badge>
            </div>

            {/* Estadísticas de beneficiarios */}
            {beneficiariesStats && (
              <div className="grid grid-cols-2 gap-3 py-3">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Beneficiarios
                        </p>
                        <p className="text-2xl font-bold">
                          {beneficiariesStats.total}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <UserCheck className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Activos</p>
                        <p className="text-2xl font-bold">
                          {beneficiariesStats.active}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Dirección */}
            {headquarter.address && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPinned className="w-4 h-4 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Dirección</p>
                  <p>{headquarter.address}</p>
                  {headquarter.city && <p>{headquarter.city}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
