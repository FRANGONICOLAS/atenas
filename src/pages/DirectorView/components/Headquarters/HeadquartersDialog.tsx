import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/common/ImageUpload";
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
import { MapPin } from "lucide-react";

interface HeadquartersDialogProps {
  open: boolean;
  onClose: () => void;
  isEditing: boolean;
  form: {
    name: string;
    status: string;
    address: string;
    city: string;
    image_url: string | null;
  };
  onFormChange: (field: string, value: string) => void;
  onImageChange: (file: File | null, previewUrl: string | null) => void;
  onSave: () => void;
}

export const HeadquartersDialog = ({
  open,
  onClose,
  isEditing,
  form,
  onFormChange,
  onImageChange,
  onSave,
}: HeadquartersDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {isEditing ? "Editar Sede" : "Nueva Sede"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
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
                onChange={(e) => onFormChange("name", e.target.value)}
                placeholder="Sede Norte"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado *</Label>
              <Select
                value={form.status}
                onValueChange={(v) => onFormChange("status", v)}
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
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Dirección *</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => onFormChange("address", e.target.value)}
                placeholder="Calle 35 #13-39"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="city">Ciudad *</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => onFormChange("city", e.target.value)}
                placeholder="Cali, Valle del Cauca, Colombia"
              />
              <p className="text-xs text-muted-foreground">
                Se recomienda incluir ciudad, departamento y país para mayor
                precisión.
              </p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <ImageUpload
                value={form.image_url}
                onChange={onImageChange}
                label="Imagen de la sede"
                description="Imagen representativa de la sede (máximo 5MB)"
                aspectRatio="video"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSave}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
