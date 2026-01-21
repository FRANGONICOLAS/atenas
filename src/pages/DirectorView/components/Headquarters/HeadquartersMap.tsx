import { MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HeadquarterDetail } from "./HeadquarterDetail";
import type { Headquarter } from "@/types";

interface HeadquartersMapProps {
  mapRef: React.RefObject<HTMLDivElement>;
  headquarters: Headquarter[];
  selectedHeadquarter: Headquarter | null;
  beneficiariesByHeadquarter: Map<string, { total: number; active: number }>;
  onCloseDetail: () => void;
}

export const HeadquartersMap = ({ 
  mapRef, 
  selectedHeadquarter,
  beneficiariesByHeadquarter,
  onCloseDetail 
}: HeadquartersMapProps) => {
  const selectedStats = selectedHeadquarter 
    ? beneficiariesByHeadquarter.get(selectedHeadquarter.headquarters_id)
    : undefined;
  return (
    <>
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
      </CardContent>
    </Card>

    {/* Dialog con información detallada de la sede */}
    <HeadquarterDetail 
      headquarter={selectedHeadquarter}
      beneficiariesStats={selectedStats}
      onClose={onCloseDetail}
    />
    </>
  );
};
