import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExportButtonProps {
  onExportUsersExcel: () => void;
  onExportUsersPDF: () => void;
  onExportDonationsExcel: () => void;
  onExportDonationsPDF: () => void;
  onExportConsolidated: () => void;
}

export const ExportButton = ({
  onExportUsersExcel,
  onExportUsersPDF,
  onExportDonationsExcel,
  onExportDonationsPDF,
  onExportConsolidated,
}: ExportButtonProps) => {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar Datos
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
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
