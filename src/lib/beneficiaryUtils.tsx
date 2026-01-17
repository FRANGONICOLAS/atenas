import { Badge } from '@/components/ui/badge';
import type { Beneficiary, BeneficiaryReport } from '@/types/beneficiary.types';

// Calcula la edad basada en la fecha de nacimiento
export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Retorna un Badge con el estilo apropiado según el estado del beneficiario
export const getStatusBadge = (status: string) => {
  switch (status) {
    case "activo":
      return <Badge variant="default">Activo</Badge>;
    case "pendiente":
      return <Badge variant="secondary">Pendiente</Badge>;
    case "inactivo":
      return <Badge variant="outline">Inactivo</Badge>;
    case "suspendido":
      return <Badge variant="destructive">Suspendido</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Retorna la clase CSS de color apropiada según el valor de desempeño
export const getPerformanceColor = (value: number): string => {
  if (value >= 90) return "text-green-600";
  if (value >= 75) return "text-blue-600";
  if (value >= 60) return "text-yellow-600";
  return "text-red-600";
};

// Mapea un array de beneficiarios a formato de reporte
export const mapToReport = (items: Beneficiary[]): BeneficiaryReport[] =>
  items.map((b) => ({
    beneficiary_id: b.beneficiary_id,
    first_name: b.first_name,
    last_name: b.last_name,
    age: calculateAge(b.birth_date),
    category: b.category,
    headquarters_id: b.headquarters_id,
    phone: b.phone,
    registry_date: b.registry_date,
    status: b.status,
    performance: b.performance,
    attendance: b.attendance,
  }));

// Obtiene la categoría de edad basada en la fecha de nacimiento
export const getAgeCategory = (birthDate: string): string => {
  const age = calculateAge(birthDate);
  if (age < 8) return "Categoría 1";
  if (age < 10) return "Categoría 2";
  if (age < 12) return "Categoría 3";
  if (age < 14) return "Categoría 4";
  return "Categoría 5";
};
