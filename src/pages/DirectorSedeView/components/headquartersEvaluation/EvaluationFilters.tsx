import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EvaluationFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  categories: Array<{ value: string; label: string }>;
}

export const EvaluationFilters = ({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
}: EvaluationFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Input
        placeholder="Buscar por beneficiario..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        className="w-[250px]"
      />
      <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
        <SelectTrigger className="w-auto">
          <SelectValue placeholder="Todas las categorias" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
