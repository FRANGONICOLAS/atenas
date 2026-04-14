import { useLanguage } from '@/contexts/LanguageContext';
import CTA from "@/components/CTA";
import { FullScreenLoader } from '@/components/common/FullScreenLoader';
import { LocationsHero, LocationsMap, LocationCard } from "../components";
import { usePublicLocations } from '@/hooks/usePublicData';

const LocationsPage = () => {
  const { t } = useLanguage();
  const { data: locations = [], isLoading: loading } = usePublicLocations(
    t.locations.defaultSchedule,
  );

  if (loading) {
    return <FullScreenLoader message={t.locations.loading} />;
  }

  return (
    <div className="min-h-screen pt-20">
      <LocationsHero />

      {/* Locations */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {locations.length === 0 ? (
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
      <LocationsMap locations={locations} />
      
      <CTA />
    </div>
  );
};

export default LocationsPage;
