import { Card, CardContent } from "@/components/ui/card";

interface HeadquarterStatsProps {
  total: number;
  active: number;
}

export const HeadquarterStats = ({ total, active }: HeadquarterStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">Total de Sedes</div>
          <div className="text-3xl font-bold">{total}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">Sedes Activas</div>
          <div className="text-3xl font-bold text-green-600">{active}</div>
        </CardContent>
      </Card>
    </div>
  );
};
