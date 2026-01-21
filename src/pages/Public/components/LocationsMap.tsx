import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Icono personalizado consistente con el resto de la aplicación
const createCustomMarkerIcon = (status: string = "active") => {
  const color = status === "maintenance" ? "#23a55a" : "#0284c7";
  
  return L.divIcon({
    html: `<svg width='32' height='40' viewBox='0 0 32 40' xmlns='http://www.w3.org/2000/svg' style='filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2))'>
      <path d='M16 0C7.73 0 1 6.73 1 15c0 10 15 25 15 25s15-15 15-25c0-8.27-6.73-15-15-15z' fill='${color}' stroke='white' stroke-width='1'/>
      <circle cx='16' cy='15' r='5' fill='white'/>
    </svg>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
    className: 'custom-marker',
  });
};

interface LocationData {
  headquarters_id: string;
  name: string;
  address: string | null;
  city: string | null;
  status: string;
  lat: number | null;
  lng: number | null;
  beneficiaryCount: number;
}

interface LocationsMapProps {
  locations: LocationData[];
}

export const LocationsMap = ({ locations }: LocationsMapProps) => {
  // Filtrar solo sedes activas y en mantenimiento
  const visibleLocations = locations.filter(
    l => l.status === "active" || l.status === "maintenance"
  );
  
  // Calcular el centro basado en las coordenadas válidas
  const validLocations = visibleLocations.filter(l => l.lat && l.lng);
  const center: [number, number] = validLocations.length > 0
    ? [
        validLocations.reduce((sum, l) => sum + (l.lat || 0), 0) / validLocations.length,
        validLocations.reduce((sum, l) => sum + (l.lng || 0), 0) / validLocations.length
      ]
    : [3.4516, -76.5320]; // Default: Cali, Colombia

  if (visibleLocations.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-foreground mb-8">
          Todas nuestras sedes
        </h2>
        <div className="rounded-xl overflow-hidden border border-border shadow-lg h-[450px]">
          <MapContainer
            // @ts-expect-error - react-leaflet types issue
            center={center}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              // @ts-expect-error - react-leaflet types issue
              maxZoom={19}
            />
            {visibleLocations.map((location) => (
              location.lat && location.lng && (
                <Marker 
                  key={location.headquarters_id}
                  position={[location.lat, location.lng] as [number, number]}
                  // @ts-expect-error - react-leaflet types issue
                  icon={createCustomMarkerIcon(location.status)}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong>{location.name}</strong><br/>
                      {location.address}
                      {location.city && (
                        <><br/>{location.city}</>
                      )}
                      <br/>
                      <span style={{ color: '#3b82f6', fontWeight: '500' }}>
                        {location.beneficiaryCount} {location.beneficiaryCount === 1 ? 'beneficiario' : 'beneficiarios'}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>
        </div>
      </div>
    </section>
  );
};
