import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HeadquarterFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export const HeadquarterFilters = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: HeadquarterFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Input
        placeholder="Buscar por nombre o dirección..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-[250px]"
      />
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-auto">
          <SelectValue placeholder="Todos los estados" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="active">Activas</SelectItem>
          <SelectItem value="inactive">Inactivas</SelectItem>
          <SelectItem value="maintenance">Mantenimiento</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
