import { UserPlus, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ActionButtonsProps {
  onCreateUser: () => void;
  onManageContent: () => void;
  onExportUsersExcel: () => void;
  onExportUsersPDF: () => void;
  onExportDonationsExcel: () => void;
  onExportDonationsPDF: () => void;
  onExportConsolidated: () => void;
}

export const ActionButtons = ({
  onCreateUser,
  onManageContent,
  onExportUsersExcel,
  onExportUsersPDF,
  onExportDonationsExcel,
  onExportDonationsPDF,
  onExportConsolidated,
}: ActionButtonsProps) => {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <Button onClick={onCreateUser} variant="outline" className="gap-2">
        <UserPlus className="w-4 h-4" />
        Nuevo Usuario
      </Button>
      <Button variant="outline" onClick={onManageContent} className="gap-2">
        <Upload className="w-4 h-4" />
        Gestionar Contenido
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar Datos
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onExportUsersExcel}>
            Usuarios (Excel)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportUsersPDF}>
            Usuarios (PDF)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportDonationsExcel}>
            Donaciones (Excel)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportDonationsPDF}>
            Donaciones (PDF)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportConsolidated}>
            Reporte Consolidado (Excel)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
