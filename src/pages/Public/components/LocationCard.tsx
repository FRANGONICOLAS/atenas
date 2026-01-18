import L from 'leaflet';
import { MapPin, Phone, Mail, Clock, Users } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import 'leaflet/dist/leaflet.css';

const createCustomMarkerIcon = () => {
  return L.divIcon({
    html: `<svg width='32' height='40' viewBox='0 0 32 40' xmlns='http://www.w3.org/2000/svg' style='filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2))'>
      <path d='M16 0C7.73 0 1 6.73 1 15c0 10 15 25 15 25s15-15 15-25c0-8.27-6.73-15-15-15z' fill='#3b82f6' stroke='white' stroke-width='1'/>
      <circle cx='16' cy='15' r='5' fill='white'/>
    </svg>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
    className: 'custom-marker',
  });
};

interface LocationCardProps {
  location: {
    headquarters_id: string;
    name: string;
    address: string | null;
    city: string | null;
    status: string;
    lat: number | null;
    lng: number | null;
    beneficiaryCount: number;
    image: string;
    phone?: string;
    email?: string;
    schedule?: string;
  };
  index: number;
}

export const LocationCard = ({ location, index }: LocationCardProps) => {
  return (
    <Card className="overflow-hidden">
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
                  // @ts-expect-error - react-leaflet types issue
                  center={[location.lat, location.lng] as [number, number]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker 
                    position={[location.lat, location.lng] as [number, number]}
                    // @ts-expect-error - react-leaflet types issue
                    icon={createCustomMarkerIcon()}
                  >
                    <Popup>
                      <div className="text-sm">
                        <strong>{location.name}</strong><br/>
                        {location.address}
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
  );
};
