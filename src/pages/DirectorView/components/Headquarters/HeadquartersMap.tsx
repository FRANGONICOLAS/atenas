import { MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Headquarter } from "@/types";

interface HeadquartersMapProps {
  mapRef: React.RefObject<HTMLDivElement>;
  headquarters: Headquarter[];
}

export const HeadquartersMap = ({ mapRef, headquarters }: HeadquartersMapProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Mapa de Sedes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={mapRef}
          className="rounded-xl overflow-hidden border border-border shadow-sm"
          style={{ height: 420, width: "100%", position: "relative", zIndex: 0 }}
        ></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {headquarters.map((hq) => (
            <div key={hq.headquarters_id} className="p-3 rounded-lg border bg-muted/40 hover:shadow-md transition-shadow">
              <div className="font-semibold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                {hq.name}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{hq.address || "Sin dirección"}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};