import { Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AdminHeaderProps {
  firstName?: string;
  lastName?: string;
  role?: string;
}

export const AdminHeader = ({ firstName, lastName, role }: AdminHeaderProps) => {
  return (
    <div className="bg-primary py-6 px-6 rounded-lg mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-foreground mb-2">
            Panel de Administración
          </h1>
          <p className="text-primary-foreground/80">
            Bienvenido, {firstName} {lastName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary-foreground" />
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {role?.toUpperCase()}
          </Badge>
        </div>
      </div>
    </div>
  );
};
