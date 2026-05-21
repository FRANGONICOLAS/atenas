import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Headquarter } from "@/types";

interface BeneficiaryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  headquarterFilter: string;
  onHeadquarterFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  headquarters: Headquarter[];
}

export const BeneficiaryFilters = ({
  search,
  onSearchChange,
  headquarterFilter,
  onHeadquarterFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  headquarters,
}: BeneficiaryFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Input
        placeholder="Buscar por nombre..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-[250px]"
      />
      <Select
        value={headquarterFilter}
        onValueChange={onHeadquarterFilterChange}
      >
        <SelectTrigger className="w-auto">
          <SelectValue placeholder="Todas las sedes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las sedes</SelectItem>
          {headquarters.map((hq) => (
            <SelectItem key={hq.headquarters_id} value={hq.headquarters_id}>
              {hq.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
        <SelectTrigger className="w-auto">
          <SelectValue placeholder="Todas las categorías" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las categorías</SelectItem>
          <SelectItem value="Categoria Sub 6">Categoria Sub 6 (6-7)</SelectItem>
          <SelectItem value="Categoria Sub 8">Categoria Sub 8 (8-9)</SelectItem>
          <SelectItem value="Categoria Sub 10">Categoria Sub 10 (10-11)</SelectItem>
          <SelectItem value="Categoria Sub 12">Categoria Sub 12 (12-13)</SelectItem>
          <SelectItem value="Categoria Sub 14">Categoria Sub 14 (14-15)</SelectItem>
          <SelectItem value="Categoria Sub 16">Categoria Sub 16 (16-17)</SelectItem>
          <SelectItem value="Categoria Sub 18">Categoria Sub 18 (18+)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
