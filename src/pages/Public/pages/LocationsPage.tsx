import { useState, useEffect, useCallback } from "react";
import CTA from "@/components/CTA";
import { headquarterService } from "@/api/services";
import type { Headquarter } from "@/types/headquarter.types";
import { LocationsHero, LocationsMap, LocationCard } from "../components";

interface LocationWithStats extends Headquarter {
  beneficiaryCount: number;
  image: string;
  phone?: string;
  email?: string;
  schedule?: string;
  lat: number | null;
  lng: number | null;
}

// Imágenes por defecto para las sedes
const defaultImages = [
  "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=600&h=400&fit=crop",
];

const LocationsPage = () => {
  const [locations, setLocations] = useState<LocationWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Función para geocodificar direcciones
  const geocodeAddress = async (
    address: string,
    city?: string,
  ): Promise<{ lat: number; lng: number } | null> => {
    try {
      const fullAddress = city ? `${address}, ${city}` : address;
      console.log("Geocoding:", fullAddress);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&addressdetails=1`,
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
        };
      }
      return null;
    } catch (error) {
      console.error("Error geocoding address:", error);
      return null;
    }
  };

  const loadHeadquarters = useCallback(async () => {
    try {
      setLoading(true);
      const data = await headquarterService.getAll();

      // Cargar conteo de beneficiarios y geocodificar para cada sede
      const locationsWithStats = await Promise.all(
        data.map(async (hq, index) => {
          const beneficiaryCount = await headquarterService.getBeneficiaryCount(
            hq.headquarters_id,
          );

          // Geocodificar la dirección real
          let coords: { lat: number; lng: number } | null = null;
          if (hq.address) {
            coords = await geocodeAddress(hq.address, hq.city || undefined);
            // Esperar un poco entre solicitudes para respetar los límites de la API
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }

          return {
            ...hq,
            beneficiaryCount,
            image: defaultImages[index % defaultImages.length],
            phone: "+57 300 123 4567", // Estos campos pueden agregarse a la BD después
            email: `${hq.name.toLowerCase().replace(/\s+/g, "")}@fundaciondeportiva.org`,
            schedule: "Lun - Sáb: 2:00 PM - 8:00 PM",
            lat: coords?.lat || null,
            lng: coords?.lng || null,
          };
        }),
      );

      setLocations(locationsWithStats);
    } catch (error) {
      console.error("Error loading headquarters:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHeadquarters();
  }, [loadHeadquarters]);

  return (
    <div className="min-h-screen pt-20">
      <LocationsHero />

      {/* Locations */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">Cargando sedes...</p>
            </div>
          ) : locations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">
                No hay sedes disponibles
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {locations.map((location, index) => (
                <LocationCard
                  key={location.headquarters_id}
                  location={location}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* General Map - Ubicado antes de las sedes individuales */}
      {!loading && <LocationsMap locations={locations} />}
      
      <CTA />
    </div>
  );
};

export default LocationsPage;
