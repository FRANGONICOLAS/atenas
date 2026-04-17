import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  beneficiaryService,
  galleryService,
  headquarterService,
  projectService,
} from "@/api/services";
import { testimonialService } from "@/api/services/testimonial.services";
import type { Headquarter } from "@/types/headquarter.types";
import type { ProjectDB } from "@/types/project.types";
import type { CreateTestimonialData } from "@/types/testimonial.types";
import { queryKeys } from "@/lib/queryKeys";

const PUBLIC_STALE_TIME = Number.POSITIVE_INFINITY;
const PUBLIC_GC_TIME = 1000 * 60 * 60 * 6; // 6 horas
const GEO_CACHE_PREFIX = "atenas:geo:";

export interface PublicProject extends ProjectDB {
  raised: number;
  percentage: number;
}

export interface PublicLocation extends Headquarter {
  beneficiaryCount: number;
  image: string | null;
  phone: string;
  email: string;
  schedule: string;
  lat: number | null;
  lng: number | null;
}

const buildAddressKey = (address: string, city?: string) => {
  const normalizedAddress = address.trim().toLowerCase();
  const normalizedCity = city?.trim().toLowerCase() ?? "";
  return `${GEO_CACHE_PREFIX}${normalizedAddress}|${normalizedCity}`;
};

const geocodeAddress = async (
  address: string,
  city?: string,
): Promise<{ lat: number; lng: number } | null> => {
  const storageKey = buildAddressKey(address, city);

  if (typeof window !== "undefined") {
    const cached = sessionStorage.getItem(storageKey);
    if (cached) {
      try {
        return JSON.parse(cached) as { lat: number; lng: number };
      } catch {
        sessionStorage.removeItem(storageKey);
      }
    }
  }

  try {
    const fullAddress = city ? `${address}, ${city}` : address;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&addressdetails=1`,
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const coords = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem(storageKey, JSON.stringify(coords));
    }

    return coords;
  } catch (error) {
    return null;
  }
};

export function usePublicGalleryItems() {
  return useQuery({
    queryKey: queryKeys.public.gallery,
    queryFn: () => galleryService.getActiveItems(),
    staleTime: PUBLIC_STALE_TIME,
    gcTime: PUBLIC_GC_TIME,
  });
}

export function usePublicProjects() {
  return useQuery<PublicProject[]>({
    queryKey: queryKeys.public.projects,
    queryFn: async () => {
      const projects = await projectService.getAll();
      const raisedTotals = await projectService.getTotalRaisedByProjectIds(
        projects.map((project) => project.project_id),
      );

      return projects.map((project) => {
        const raised = raisedTotals[project.project_id] || 0;
        const goal = project.finance_goal || 0;
        const percentage =
          goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0;

        return {
          ...project,
          raised,
          percentage,
        };
      });
    },
    staleTime: PUBLIC_STALE_TIME,
    gcTime: PUBLIC_GC_TIME,
  });
}

export function usePublicBeneficiaries() {
  return useQuery({
    queryKey: queryKeys.public.beneficiaries,
    queryFn: () => beneficiaryService.getPublicAll(),
    staleTime: PUBLIC_STALE_TIME,
    gcTime: PUBLIC_GC_TIME,
  });
}

export function usePublicLocations(defaultSchedule: string) {
  return useQuery<PublicLocation[]>({
    queryKey: queryKeys.public.locations(defaultSchedule),
    queryFn: async () => {
      const headquarters = await headquarterService.getAll();

      return Promise.all(
        headquarters.map(async (hq) => {
          const [beneficiaryCount, coords] = await Promise.all([
            headquarterService.getBeneficiaryCount(hq.headquarters_id),
            hq.address
              ? geocodeAddress(hq.address, hq.city || undefined)
              : Promise.resolve(null),
          ]);

          return {
            ...hq,
            beneficiaryCount,
            image: hq.image_url,
            phone: "+57 300 123 4567",
            email: `${hq.name.toLowerCase().replace(/\s+/g, "")}@fundaciondeportiva.org`,
            schedule: defaultSchedule,
            lat: coords?.lat || null,
            lng: coords?.lng || null,
          };
        }),
      );
    },
    staleTime: PUBLIC_STALE_TIME,
    gcTime: PUBLIC_GC_TIME,
  });
}

export function usePublicTestimonials() {
  const queryClient = useQueryClient();

  const approvedQuery = useQuery({
    queryKey: queryKeys.public.testimonialsApproved,
    queryFn: () => testimonialService.getApproved(),
    staleTime: PUBLIC_STALE_TIME,
    gcTime: PUBLIC_GC_TIME,
  });

  const createMutation = useMutation({
    mutationFn: (testimonialData: CreateTestimonialData) =>
      testimonialService.create(testimonialData),
    onSuccess: async () => {
      toast.success("Testimonio enviado", {
        description: "Tu testimonio será revisado por nuestro equipo",
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.public.testimonialsApproved,
      });
    },
    onError: (error) => {
      toast.error("Error al enviar testimonio", {
        description: "No se pudo crear el testimonio",
      });
    },
  });

  const handleCreate = async (testimonialData: CreateTestimonialData) => {
    try {
      await createMutation.mutateAsync(testimonialData);
      return true;
    } catch {
      return false;
    }
  };

  return {
    testimonials: approvedQuery.data ?? [],
    loading: approvedQuery.isLoading,
    error: approvedQuery.error ?? null,
    handleCreate,
    isCreating: createMutation.isPending,
  };
}
