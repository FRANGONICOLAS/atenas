import { useState, useEffect } from "react";
import { toast } from "sonner";
import { headquarterService } from "@/api/services";
import type { Headquarter } from "@/types";
import { FIVE_MINUTES_MS, getTimedCache, setTimedCache } from "@/lib/timedCache";

const DIRECTOR_HEADQUARTERS_CACHE_KEY = "director:headquarters";

export const useDirectorView = () => {
  const cachedHeadquarters = getTimedCache<Headquarter[]>(
    DIRECTOR_HEADQUARTERS_CACHE_KEY,
  );

  // Headquarters state (solo para listado)
  const [headquarters, setHeadquarters] = useState<Headquarter[]>(
    cachedHeadquarters ?? [],
  );
  const [headquartersLoading, setHeadquartersLoading] = useState(
    !cachedHeadquarters,
  );

  // Cargar sedes desde Supabase
  const loadHeadquarters = async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cached = getTimedCache<Headquarter[]>(DIRECTOR_HEADQUARTERS_CACHE_KEY);
        if (cached) {
          setHeadquarters(cached);
          setHeadquartersLoading(false);
          return;
        }
      }

      setHeadquartersLoading(true);
      const data = await headquarterService.getAll();
      setHeadquarters(data);
      setTimedCache(DIRECTOR_HEADQUARTERS_CACHE_KEY, data, FIVE_MINUTES_MS);
    } catch (error) {
      console.error("Error loading headquarters:", error);
      toast.error("Error al cargar sedes");
    } finally {
      setHeadquartersLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    void loadHeadquarters();
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
