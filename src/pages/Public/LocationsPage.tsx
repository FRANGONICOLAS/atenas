import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import CTA from '@/components/CTA';
import { headquarterService } from '@/api/services';
import type { Headquarter } from '@/types/headquarter.types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para los iconos de Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationWithStats extends Headquarter {
  beneficiaryCount: number;
  image: string;
  phone?: string;
  email?: string;
  schedule?: string;
  lat?: number;
  lng?: number;
}

const LocationsPage = () => {
  const { t } = useLanguage();
  const [locations, setLocations] = useState<LocationWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Imágenes por defecto para las sedes
  const defaultImages = [
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=600&h=400&fit=crop',
  ];

  useEffect(() => {
    loadHeadquarters();
  }, []);

  const loadHeadquarters = async () => {
    try {
      setLoading(true);
      const data = await headquarterService.getAll();
      
      // Coordenadas por defecto para Bogotá y alrededores
      const defaultCoordinates = [
        { lat: 4.7110, lng: -74.0721 }, // Norte
        { lat: 4.6097, lng: -74.0817 }, // Sur
        { lat: 4.6809, lng: -74.1021 }, // Occidente
        { lat: 4.6533, lng: -74.0833 }, // Centro
      ];
      
      // Cargar conteo de beneficiarios para cada sede
      const locationsWithStats = await Promise.all(
        data.map(async (hq, index) => {
          const beneficiaryCount = await headquarterService.getBeneficiaryCount(hq.headquarters_id);
          const coords = defaultCoordinates[index % defaultCoordinates.length];
          
          return {
            ...hq,
            beneficiaryCount,
            image: defaultImages[index % defaultImages.length],
            phone: '+57 300 123 4567', // Estos campos pueden agregarse a la BD después
            email: `${hq.name.toLowerCase().replace(/\s+/g, '')}@fundaciondeportiva.org`,
            schedule: 'Lun - Sáb: 2:00 PM - 8:00 PM',
            lat: coords.lat,
            lng: coords.lng,
          };
        })
      );
      
      setLocations(locationsWithStats);
    } catch (error) {
      console.error('Error loading headquarters:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            {t.locations.title}
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
            {t.locations.subtitle}
          </p>
        </div>
      </section>

      {/* Locations */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">Cargando sedes...</p>
            </div>
          ) : locations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">No hay sedes disponibles</p>
            </div>
          ) : (
            <div className="space-y-12">
              {locations.map((location, index) => (
                <Card key={location.headquarters_id} className="overflow-hidden">
                  <div className={`grid lg:grid-cols-2 gap-0 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                    {/* Image */}
                    <div className={`relative h-64 lg:h-auto ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                      <img 
                        src={location.image} 
                        alt={location.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-primary text-lg px-4 py-2">
                          {location.name}
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge 
                          variant={location.status === 'active' ? 'default' : 'secondary'}
                          className="text-sm px-3 py-1"
                        >
                          {location.status === 'active' ? 'Activa' : 
                           location.status === 'maintenance' ? 'Mantenimiento' : 'Inactiva'}
                        </Badge>
                      </div>
                    </div>

                    {/* Info */}
                    <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                      <CardHeader>
                        <CardTitle className="text-2xl text-foreground flex items-center gap-2">
                          <MapPin className="w-6 h-6 text-primary" />
                          {location.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                              <div className="font-medium text-foreground">Dirección</div>
                              <div className="text-muted-foreground text-sm">
                                {location.address || 'Dirección no disponible'}
                                {location.city && `, ${location.city}`}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                              <div className="font-medium text-foreground">Teléfono</div>
                              <div className="text-muted-foreground text-sm">{location.phone}</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                              <div className="font-medium text-foreground">Email</div>
                              <div className="text-muted-foreground text-sm">{location.email}</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                              <div className="font-medium text-foreground">Horario</div>
                              <div className="text-muted-foreground text-sm">{location.schedule}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                          <Users className="w-5 h-5 text-secondary" />
                          <span className="font-medium text-foreground">
                            {location.beneficiaryCount} {location.beneficiaryCount === 1 ? 'beneficiario' : 'beneficiarios'} activos
                          </span>
                        </div>

                        {/* Mapa individual de la sede */}
                        {location.lat && location.lng && (
                          <div className="mt-4 rounded-lg overflow-hidden border border-border h-[200px]">
                            <MapContainer
                              // @ts-ignore - react-leaflet types issue
                              center={[location.lat, location.lng]}
                              zoom={15}
                              style={{ height: '100%', width: '100%' }}
                              scrollWheelZoom={false}
                            >
                              <TileLayer
                                // @ts-ignore
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              />
                              <Marker 
                                // @ts-ignore
                                position={[location.lat, location.lng]}
                              >
                                <Popup>
                                  <div className="text-center">
                                    <p className="font-semibold">{location.name}</p>
                                    <p className="text-sm">{location.address}</p>
                                  </div>
                                </Popup>
                              </Marker>
                            </MapContainer>
                          </div>
                        )}
                      </CardContent>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* General Map */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-8">
            Todas nuestras sedes
          </h2>
          <div className="rounded-xl overflow-hidden border border-border shadow-lg h-[450px]">
            {locations.length > 0 && (
              <MapContainer
                // @ts-ignore - react-leaflet types issue
                center={[4.6533, -74.0833]}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  // @ts-ignore
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {locations.map((location) => (
                  location.lat && location.lng && (
                    <Marker 
                      key={location.headquarters_id}
                      // @ts-ignore
                      position={[location.lat, location.lng]}
                    >
                      <Popup>
                        <div className="text-center space-y-1">
                          <p className="font-semibold text-base">{location.name}</p>
                          <p className="text-sm text-muted-foreground">{location.address}</p>
                          {location.city && (
                            <p className="text-sm text-muted-foreground">{location.city}</p>
                          )}
                          <p className="text-sm font-medium text-primary">
                            {location.beneficiaryCount} {location.beneficiaryCount === 1 ? 'beneficiario' : 'beneficiarios'}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}
              </MapContainer>
            )}
          </div>
        </div>
      </section>
      <CTA />
    </div>
  );
};

export default LocationsPage;