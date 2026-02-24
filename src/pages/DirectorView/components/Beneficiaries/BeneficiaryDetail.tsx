import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Activity, Eye, Home, MapPin, Phone } from "lucide-react";
import type { Beneficiary } from "@/types/beneficiary.types";
import type { Headquarter } from "@/types";

interface BeneficiaryDetailProps {
  beneficiary: Beneficiary | null;
  onClose: () => void;
  headquarters: Headquarter[];
  calculateAge: (birthDate: string) => number;
  getStatusBadge: (status: string) => React.ReactNode;
  getPerformanceColor: (value: number) => string;
}

export const BeneficiaryDetail = ({
  beneficiary,
  onClose,
  headquarters,
  calculateAge,
  getStatusBadge,
  getPerformanceColor,
}: BeneficiaryDetailProps) => {
  if (!beneficiary) return null;

  const hq = headquarters.find(
    (h) => h.headquarters_id === beneficiary.headquarters_id,
  );

  return (
    <Dialog open={!!beneficiary} onOpenChange={onClose}>
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
        <div className="space-y-6 py-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Personal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Nombre</div>
                  <div className="font-semibold">
                    {beneficiary.first_name} {beneficiary.last_name}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Edad</div>
                  <div className="font-semibold">
                    {calculateAge(beneficiary.birth_date)} años
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Categoría</div>
                  <Badge variant="outline">{beneficiary.category}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Sede</div>
                    <div className="font-semibold">{hq?.name || "N/A"}</div>
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Estado</div>
                  {getStatusBadge(beneficiary.status || "inactivo")}
                </div>
                <div>
                  <div className="text-muted-foreground">Nacimiento</div>
                  <div className="font-semibold">{beneficiary.birth_date}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Ingreso</div>
                  <div className="font-semibold">
                    {beneficiary.registry_date}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Acudiente</div>
                    <div className="font-semibold">
                      {beneficiary.guardian || "N/A"}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Teléfono</div>
                  <div className="font-semibold">{beneficiary.phone}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                <div className="p-3 shadow-md bg-foreground/15 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Activity className="w-4 h-4" /> Rendimiento Deportivo
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Progress
                      value={beneficiary.performance || 0}
                      className="w-32"
                    />
                    <span
                      className={`text-sm font-semibold ${getPerformanceColor(
                        beneficiary.performance || 0,
                      )}`}
                    >
                      {beneficiary.performance || 0}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                <div className="flex items-start gap-2">
                  <Home className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <div className="text-muted-foreground">Dirección</div>
                    <div className="font-medium">
                      {beneficiary.address || "N/A"}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">
                    Contacto de Emergencia
                  </div>
                  <div className="font-medium">
                    {beneficiary.emergency_contact || "N/A"}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-muted-foreground text-sm">
                  Información Médica
                </div>
                <div className="font-medium">
                  {beneficiary.medical_info || "N/A"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
