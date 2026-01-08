import { UserPlus, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Role {
  role_id: string;
  role_name: string;
}

interface UserForm {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  birthdate: string;
  phone: string;
}

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: any | null;
  userForm: UserForm;
  onUserFormChange: (form: UserForm) => void;
  availableRoles: Role[];
  selectedRoles: string[];
  onSelectedRolesChange: (roles: string[]) => void;
  onSave: () => void;
}

export const UserDialog = ({
  open,
  onOpenChange,
  editingUser,
  userForm,
  onUserFormChange,
  availableRoles,
  selectedRoles,
  onSelectedRolesChange,
  onSave,
}: UserDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </DialogTitle>
          <DialogDescription>
            {editingUser ? 'Modifica la información del usuario' : 'Completa el formulario para crear un nuevo usuario'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nombre *</Label>
              <Input
                id="first_name"
                value={userForm.first_name}
                onChange={(e) => onUserFormChange({ ...userForm, first_name: e.target.value })}
                placeholder="Juan"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Apellido *</Label>
              <Input
                id="last_name"
                value={userForm.last_name}
                onChange={(e) => onUserFormChange({ ...userForm, last_name: e.target.value })}
                placeholder="Pérez"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={userForm.username}
                onChange={(e) => onUserFormChange({ ...userForm, username: e.target.value })}
                placeholder="juanperez"
                disabled={!!editingUser}
              />
              {editingUser && (
                <p className="text-xs text-muted-foreground">No se puede modificar</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={userForm.email}
                onChange={(e) => onUserFormChange({ ...userForm, email: e.target.value })}
                placeholder="juan@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthdate">Fecha de Nacimiento</Label>
              <Input
                id="birthdate"
                type="date"
                value={userForm.birthdate}
                onChange={(e) => onUserFormChange({ ...userForm, birthdate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={userForm.phone}
                onChange={(e) => onUserFormChange({ ...userForm, phone: e.target.value })}
                placeholder="+57 300 123 4567"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div>
              <Label className="text-base font-semibold">Roles del Usuario</Label>
              <p className="text-xs text-muted-foreground mt-1">
                {editingUser 
                  ? 'Gestiona los permisos del usuario asignando roles' 
                  : 'Selecciona los roles iniciales (se aplicarán después del registro)'}
              </p>
            </div>
              
            <div className="grid grid-cols-2 gap-4">
              {/* Left column: Add role selector */}
              <div className="space-y-2">
                <Label htmlFor="role-select">Agregar Rol</Label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value && !selectedRoles.includes(value)) {
                      onSelectedRolesChange([...selectedRoles, value]);
                    }
                  }}
                >
                  <SelectTrigger id="role-select">
                    <SelectValue placeholder="Selecciona un rol..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem
                        key={role.role_id}
                        value={role.role_id}
                        disabled={selectedRoles.includes(role.role_id)}
                      >
                        <span className="capitalize">{role.role_name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Right column: Display selected roles as badges */}
              <div className="space-y-2">
                <Label>Roles Asignados</Label>
                {selectedRoles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedRoles.map((roleId) => {
                      const role = availableRoles.find(r => r.role_id === roleId);
                      return (
                        <Badge key={roleId} variant="secondary" className="gap-1">
                          <span className="capitalize">{role?.role_name || roleId}</span>
                          <button
                            type="button"
                            onClick={() => onSelectedRolesChange(selectedRoles.filter(r => r !== roleId))}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    Sin roles asignados
                  </div>
                )}
              </div>
            </div>

            {selectedRoles.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
                <AlertCircle className="w-4 h-4" />
                El usuario debe tener al menos un rol asignado
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={onSave}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {editingUser ? 'Actualizar' : 'Crear'} Usuario
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
