import { useState, useEffect } from "react";
import { toast } from "sonner";
import { headquarterService } from "@/api/services";
import type { Headquarter } from "@/types";

export const useDirectorView = () => {
  // Headquarters state (solo para listado)
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([]);
  const [headquartersLoading, setHeadquartersLoading] = useState(true);

  // Cargar sedes desde Supabase
  const loadHeadquarters = async () => {
    try {
      setHeadquartersLoading(true);
      const data = await headquarterService.getAll();
      setHeadquarters(data);
    } catch (error) {
      console.error("Error loading headquarters:", error);
      toast.error("Error al cargar sedes");
    } finally {
      setHeadquartersLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadHeadquarters();
  }, []);

  // Utilities
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return {
    // Headquarters (solo para listado en dropdowns)
    headquarters,
    headquartersLoading,
    loadHeadquarters,

    // Utilities
    formatCurrency,
    formatDate,
  };
};
