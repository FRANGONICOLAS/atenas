import { useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { headquarterService } from "@/api/services";

interface HeadquarterResult {
  headquarterId: string;
  headquarterName: string;
}

export function useHeadquarterResolution() {
  const { user } = useAuth();

  const resolveHeadquarter = useCallback(async (): Promise<HeadquarterResult> => {
    // Nivel 1: user.headquarter_id directo
    if (user?.headquarter_id) {
      try {
        const hq = await headquarterService.getById(user.headquarter_id);
        if (hq) return { headquarterId: hq.headquarters_id, headquarterName: hq.name };
      } catch (error) {
        console.warn("No se pudo resolver sede desde user.headquarter_id:", error);
      }
    }

    // Nivel 2: metadata del usuario (headquarter_name)
    const metaName = (user as Record<string, unknown>)?.user_metadata?.["headquarter_name"] as string | undefined;
    if (metaName) {
      try {
        const results = await headquarterService.searchByName(metaName);
        if (results.length > 0) {
          const hq = results[0];
          return { headquarterId: hq.headquarters_id, headquarterName: hq.name };
        }
      } catch {
        // ignorar
      }
    }

    // Nivel 3: buscar por director_id
    if (user?.id) {
      const directorHeadquarters = await headquarterService.getByDirectorId(user.id);
      if (directorHeadquarters.length > 0) {
        const hq = directorHeadquarters[0];
        return { headquarterId: hq.headquarters_id, headquarterName: hq.name };
      }
    }

    throw new Error("No se pudo determinar la sede asignada al usuario");
  }, [user]);

  return { resolveHeadquarter, userId: user?.id };
}
