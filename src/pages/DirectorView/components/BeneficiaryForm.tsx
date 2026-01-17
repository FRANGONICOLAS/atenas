import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { UserCheck } from "lucide-react";
import type { Headquarter } from "@/types";
import type {
  CreateBeneficiaryData,
  BeneficiaryStatus,
} from "@/types/beneficiary.types";

type BeneficiaryFormData = Required<CreateBeneficiaryData> & {
  status: BeneficiaryStatus;
  performance: number;
  attendance: number;
  registry_date: string;
  guardian: string;
  address: string;
  emergency_contact: string;
  medical_info: string;
};

interface BeneficiaryFormProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  isEditing: boolean;
  form: BeneficiaryFormData;
  setForm: React.Dispatch<React.SetStateAction<BeneficiaryFormData>>;
  headquarters: Headquarter[];
}

export const BeneficiaryForm = ({
  open,
  onClose,
  onSave,
  isEditing,
  form,
  setForm,
  headquarters,
}: BeneficiaryFormProps) => {
  // Calcular fecha máxima para fecha de nacimiento (17 años atrás)
  const today = new Date();
  const maxDate = new Date(
    today.getFullYear() - 17,
    today.getMonth(),
    today.getDate(),
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            {isEditing ? "Editar Beneficiario" : "Agregar Beneficiario"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Actualiza la información del beneficiario"
              : "Completa los datos para registrar un beneficiario"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nombre *</Label>
              <Input
                id="first_name"
                value={form.first_name}
                onChange={(e) =>
                  setForm({ ...form, first_name: e.target.value })
                }
                placeholder="Nombre"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Apellido *</Label>
              <Input
                id="last_name"
                value={form.last_name}
                onChange={(e) =>
                  setForm({ ...form, last_name: e.target.value })
                }
                placeholder="Apellido"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birth_date">Fecha de Nacimiento *</Label>
              <DatePicker
                date={
                  form.birth_date
                    ? new Date(form.birth_date + "T12:00:00")
                    : undefined
                }
                onDateChange={(date) => {
                  if (date) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");
                    setForm({ ...form, birth_date: `${year}-${month}-${day}` });
                  } else {
                    setForm({ ...form, birth_date: "" });
                  }
                }}
                maxDate={maxDate}
                placeholder="Selecciona fecha de nacimiento"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="300-000-0000"
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
                  <SelectItem value="Categoría 1">Categoría 1 (6-7)</SelectItem>
                  <SelectItem value="Categoría 2">Categoría 2 (8-9)</SelectItem>
                  <SelectItem value="Categoría 3">
                    Categoría 3 (10-11)
                  </SelectItem>
                  <SelectItem value="Categoría 4">
                    Categoría 4 (12-14)
                  </SelectItem>
                  <SelectItem value="Categoría 5">
                    Categoría 5 (15-17)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="headquarters_id">Sede *</Label>
              <Select
                value={form.headquarters_id}
                onValueChange={(value) =>
                  setForm({ ...form, headquarters_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona sede" />
                </SelectTrigger>
                <SelectContent>
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
            <div className="space-y-2">
              <Label htmlFor="status">Estado *</Label>
              <Select
                value={form.status}
                onValueChange={(value: BeneficiaryStatus) =>
                  setForm({ ...form, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                  <SelectItem value="suspendido">Suspendido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="registry_date">Fecha de Ingreso</Label>
              <DatePicker
                date={
                  form.registry_date
                    ? new Date(form.registry_date + "T12:00:00")
                    : undefined
                }
                onDateChange={(date) => {
                  if (date) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");
                    setForm({
                      ...form,
                      registry_date: `${year}-${month}-${day}`,
                    });
                  } else {
                    setForm({ ...form, registry_date: "" });
                  }
                }}
                placeholder="Selecciona fecha de registro"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="performance">Rendimiento (%)</Label>
              <Input
                id="performance"
                type="number"
                value={form.performance}
                onChange={(e) =>
                  setForm({
                    ...form,
                    performance: parseInt(e.target.value) || 0,
                  })
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
                  setForm({
                    ...form,
                    attendance: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="95"
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
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Dirección del beneficiario"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_contact">Contacto de Emergencia</Label>
              <Input
                id="emergency_contact"
                value={form.emergency_contact}
                onChange={(e) =>
                  setForm({ ...form, emergency_contact: e.target.value })
                }
                placeholder="Nombre y teléfono del contacto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medical_info">Información Médica</Label>
              <Input
                id="medical_info"
                value={form.medical_info}
                onChange={(e) =>
                  setForm({ ...form, medical_info: e.target.value })
                }
                placeholder="Alergias o condiciones relevantes"
              />
            </div>
          </div>
          {(form.performance > 0 || form.attendance > 0) && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 shadow-md rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">
                  Rendimiento
                </div>
                <Progress value={form.performance} />
                <div className="text-xs mt-1">{form.performance}%</div>
              </div>
              <div className="p-3 shadow-md rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">
                  Asistencia
                </div>
                <Progress value={form.attendance} />
                <div className="text-xs mt-1">{form.attendance}%</div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSave}>
            {isEditing ? "Actualizar" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
