import { MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Location {
  id: number;
  name: string;
  players: number;
  capacity: number;
  utilization: number;
  status: string;
  address: string;
  coordinates: string;
}

interface MapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  locations: Location[];
}

export const MapDialog = ({ isOpen, onClose, locations }: MapDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Mapa de Sedes
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center space-y-2">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">
                Mapa Interactivo de Sedes
              </p>
              <p className="text-sm text-muted-foreground">
                Aquí se mostraría el mapa con las ubicaciones de las sedes
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-2 mt-4">
          <h4 className="font-semibold text-sm">Sedes Disponibles:</h4>
          {locations.map((location) => (
            <div
              key={location.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
            >
              <div>
                <p className="font-medium">{location.name}</p>
                <p className="text-sm text-muted-foreground">{location.address}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                {location.players}/{location.capacity} niños
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
