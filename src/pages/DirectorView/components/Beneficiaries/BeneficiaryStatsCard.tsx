import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin } from "lucide-react";
import type { SedeStats } from "@/types/beneficiary.types";

export const BeneficiaryStatsCard = ({
  name,
  total,
  active,
  avgPerf,
}: SedeStats) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              {name}
            </span>
          </div>
          <Badge variant="secondary">{total} totales</Badge>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Activos</span>
          <span className="font-semibold text-foreground">{active}</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Rendimiento promedio</span>
            <span className="font-semibold text-foreground">{avgPerf}%</span>
          </div>
          <Progress value={avgPerf} />
        </div>
      </CardContent>
    </Card>
  );
};
