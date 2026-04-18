import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import type { Beneficiary } from "@/types/beneficiary.types";
import type { Headquarter } from "@/types";

interface BeneficiaryDetailProps {
  beneficiary: Beneficiary | null;
  onClose: () => void;
  headquarters: Headquarter[];
  calculateAge: (birthDate: string) => number;
  getStatusBadge: (status: string) => React.ReactNode;
}

const renderValue = (value: unknown): string => {
  if (value === undefined || value === null || value === "") {
    return "No registrado";
  }

  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return value.map((item) => renderValue(item)).join(", ");
    }

    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${key}: ${renderValue(item)}`)
      .join(", ");
  }

  return String(value);
};

const capitalize = (value: string | undefined | null) =>
  value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : "";

const getInitials = (firstName: string, lastName: string) =>
  `${firstName.charAt(0) || ""}${lastName.charAt(0) || ""}`.toUpperCase();

export const BeneficiaryDetail = ({
  beneficiary,
  onClose,
  headquarters,
  calculateAge,
  getStatusBadge,
}: BeneficiaryDetailProps) => {
  if (!beneficiary) return null;

  const hq = headquarters.find(
    (h) => h.headquarters_id === beneficiary.headquarters_id,
  );

  return (
    <Dialog open={!!beneficiary} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Ficha del Jugador
          </DialogTitle>
          <DialogDescription>
            Información principal del jugador.
          </DialogDescription>
        </DialogHeader>

        <Card className="overflow-hidden">
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              <div className="space-y-4 rounded-xl border border-border bg-background p-4">
                <div className="flex flex-col items-center gap-4 text-center">
                  <Avatar className="h-32 w-32 overflow-hidden rounded-full">
                    {beneficiary.photo_url ? (
                      <AvatarImage
                        src={beneficiary.photo_url}
                        className="object-cover"
                      />
                    ) : (
                      <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                        {getInitials(
                          beneficiary.first_name,
                          beneficiary.last_name,
                        )}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <div className="text-sm text-muted-foreground">Jugador</div>
                    <div className="text-xl font-semibold">
                      {beneficiary.first_name} {beneficiary.last_name}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{beneficiary.category}</Badge>
                    <Badge variant="outline">
                      {capitalize(beneficiary.gender) || "Sin género"}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Edad</div>
                    <div className="font-semibold">
                      {calculateAge(beneficiary.birth_date)} años
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Estado</div>
                    {getStatusBadge(beneficiary.status || "inactivo")}
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Sede</div>
                    <div className="font-semibold">
                      {hq?.name || "No asignada"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 py-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1 text-sm">
                    <div className="text-muted-foreground">
                      Fecha de nacimiento
                    </div>
                    <div className="font-semibold">
                      {renderValue(beneficiary.birth_date)}
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="text-muted-foreground">
                      Fecha de ingreso
                    </div>
                    <div className="font-semibold">
                      {renderValue(beneficiary.registry_date)}
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="text-muted-foreground">Teléfono</div>
                    <div className="font-semibold">
                      {renderValue(beneficiary.phone)}
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="text-muted-foreground">Acudiente</div>
                    <div className="font-semibold">
                      {renderValue(beneficiary.guardian)}
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="text-muted-foreground">Dirección</div>
                    <div className="font-semibold">
                      {renderValue(beneficiary.address)}
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="text-muted-foreground">
                      Contacto de emergencia
                    </div>
                    <div className="font-semibold">
                      {renderValue(beneficiary.emergency_contact)}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-background p-4 text-sm">
                  <div className="mb-2 text-muted-foreground">
                    Observaciones
                  </div>
                  <div className="font-medium">
                    {renderValue(beneficiary.observation)}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-xl border border-border bg-background p-4 text-sm">
                    <div className="mb-2 text-muted-foreground">
                      Información Médica
                    </div>
                    <div className="font-medium">
                      {renderValue(beneficiary.medical_info)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
