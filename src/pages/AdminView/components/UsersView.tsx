import { Edit, Trash2, Search, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  roles?: string[];
  created_at?: string;
  birthdate?: string;
  phone?: string;
}

interface UsersViewProps {
  users: User[];
  isLoadingUsers: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const UsersView = ({
  users,
  isLoadingUsers,
  searchTerm,
  onSearchChange,
  onEditUser,
  onDeleteUser,
}: UsersViewProps) => {
  const filteredUsers = users.filter(u => {
    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
    const username = u.username.toLowerCase();
    const email = u.email.toLowerCase();
    const term = searchTerm.toLowerCase();
    return fullName.includes(term) || username.includes(term) || email.includes(term);
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Gestión de Usuarios</CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios..."
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Registro</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingUsers ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-muted-foreground">Cargando usuarios...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No hay usuarios registrados</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.first_name || ''} {u.last_name || ''}
                    <div className="text-xs text-muted-foreground">@{u.username}</div>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {u.roles && u.roles.length > 0 ? (
                        u.roles.map((role, idx) => (
                          <Badge key={idx} variant="outline">
                            {role.toUpperCase()}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline">DONATOR</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">Activo</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('es-CO') : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onEditUser(u)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDeleteUser(u.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
