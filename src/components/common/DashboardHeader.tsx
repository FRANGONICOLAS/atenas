import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  title: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  icon: LucideIcon;
  roleIcon: LucideIcon;
  subtitle?: string;
}

export const DashboardHeader = ({
  title,
  firstName,
  lastName,
  role,
  icon: Icon,
  roleIcon: RoleIcon,
  subtitle,
}: DashboardHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Icon className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        <p className="text-foreground-secondary">
          Bienvenido, {firstName} {lastName}
        </p>
        {subtitle && (
          <p className="text-gray-500 text-sm">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2 mb-4">
        <RoleIcon className="w-8 h-8 text-secondary" />
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {role?.toUpperCase()}
        </Badge>
      </div>
    </div>
  );
};
