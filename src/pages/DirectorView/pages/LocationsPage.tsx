import { MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LocationsView, MapDialog } from '../components';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Headquarter } from '@/types';

const LocationsPage = () => {
  const [showMapDialog, setShowMapDialog] = useState(false);

  const locations: Headquarter[] = [
    {
      id: 1,
      name: 'Sede Norte',
      players: 87,
      capacity: 100,
      utilization: 87,
      status: 'active',
      address: 'Cra 100 #15-20, Cali',
      coordinates: '3.4516, -76.5320',
    },
    {
      id: 2,
      name: 'Sede Centro',
      players: 92,
      capacity: 100,
      utilization: 92,
      status: 'active',
      address: 'Calle 5 #45-12, Cali',
      coordinates: '3.4372, -76.5225',
    },
    {
      id: 3,
      name: 'Sede Sur',
      players: 64,
      capacity: 80,
      utilization: 80,
      status: 'active',
      address: 'Cra 50 #8-35, Cali',
      coordinates: '3.3950, -76.5400',
    },
  ];

  const handleLocationClick = (locationId: number) => {
    const location = locations.find((loc) => loc.id === locationId);
    if (location) {
      toast.info(`Información de ${location.name}`, {
        description: `${location.address} - ${location.players}/${location.capacity} niños`,
      });
    }
  };

  const handleViewMap = () => {
    setShowMapDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Sedes</h2>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nueva Sede
        </Button>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LocationsView
          locations={locations}
          onLocationClick={handleLocationClick}
          onViewMap={handleViewMap}
        />
      </div>

      {/* Dialogs */}
      <MapDialog
        isOpen={showMapDialog}
        onClose={() => setShowMapDialog(false)}
        locations={locations}
      />
    </div>
  );
};

export default LocationsPage;
