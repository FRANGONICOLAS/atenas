import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Headquarter } from "@/types";

interface LocationsViewProps {
  locations: Headquarter[];
  onLocationClick: (locationId: number) => void;
  onViewMap: () => void;
}

export const LocationsView = ({
  locations,
  onLocationClick,
  onViewMap,
}: LocationsViewProps) => {
  return (
    <div className="space-y-4">
      <Button size="sm" variant="outline" onClick={onViewMap}>
        Ver Mapa
      </Button>
      <div className="flex flex-row gap-4">
        {locations.map((location) => (
          <Card
            key={location.id}
            className="border-l-4 border-l-primary hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onLocationClick(location.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-foreground">
                    {location.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {location.players} de {location.capacity} niños
                  </p>
                </div>
                <Badge
                  variant={
                    location.status === "active" ? "default" : "secondary"
                  }
                >
                  Activa
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Utilización</span>
                  <span className="font-medium">{location.utilization}%</span>
                </div>
                <Progress value={location.utilization} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
