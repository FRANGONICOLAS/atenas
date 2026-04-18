import { MapPin, Phone, Mail, Clock, Users, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  const mapQuery = location.lat && location.lng
    ? `${location.lat},${location.lng}`
    : `${location.address || ''} ${location.city || ''}`.trim();
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`;
  const mapOpenUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  return (
    <Card className="overflow-hidden">
      <div className={`grid lg:grid-cols-2 gap-0 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
        {/* Image */}
        <div className={`relative h-64 lg:h-auto ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
          {location.image ? (
            <img 
              src={location.image} 
              alt={location.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const placeholder = document.createElement('div');
                  placeholder.className = 'w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10';
                  placeholder.innerHTML = '<svg class="w-24 h-24 text-muted-foreground/30" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>';
                  parent.appendChild(placeholder);
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="w-24 h-24 text-muted-foreground/50" />
            </div>
          )}
          <div className="absolute top-4 left-4">
            <Badge className="bg-primary text-lg px-4 py-2">
              {location.name}
            </Badge>
          </div>
          <div className="absolute top-4 right-4">
            <Badge 
              variant={
                location.status === "active"
                  ? "default"
                  : location.status === "maintenance"
                  ? "secondary"
                  : "outline"
              }
              className="text-sm px-3 py-1"
            >
              {location.status === "active"
                ? "Activa"
                : location.status === "maintenance"
                ? "Mantenimiento"
                : "Inactiva"}
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
                {location.beneficiaryCount} {location.beneficiaryCount === 1 ? 'jugador' : 'jugadores'} activos
              </span>
            </div>

            {/* Mapa individual de la sede */}
            {mapQuery && (
              <div className="mt-4 rounded-lg overflow-hidden border border-border h-[200px] relative group">
                <iframe
                  src={mapEmbedUrl}
                  title={`Mapa de ${location.name}`}
                  className="w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <a
                  href={mapOpenUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0"
                  aria-label={`Abrir ubicación de ${location.name} en Google Maps`}
                />
                <div className="absolute bottom-2 right-2 bg-card/90 text-foreground text-xs px-2 py-1 rounded border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Abrir en Google Maps
                </div>
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  );
};
