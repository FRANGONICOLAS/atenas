import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsViewProps {
  newPlayersThisMonth: number;
  donationsProcessedThisMonth: number;
  completedProjects: number;
  totalDonatedThisMonth: number;
  formatCurrency: (value: number) => string;
}

export const AnalyticsView = ({
  newPlayersThisMonth,
  donationsProcessedThisMonth,
  completedProjects,
  totalDonatedThisMonth,
  formatCurrency,
}: AnalyticsViewProps) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Métricas Mensuales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-background shadow-md rounded-lg">
              <span className="text-sm font-medium">Nuevos jugadores este mes</span>
              <span className="text-2xl font-bold text-blue-600">
                +{newPlayersThisMonth}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-background shadow-md rounded-lg">
              <span className="text-sm font-medium">Donaciones Procesadas</span>
              <span className="text-2xl font-bold text-green-600">
                {donationsProcessedThisMonth}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-background shadow-md rounded-lg">
              <span className="text-sm font-medium">Proyectos Completados</span>
              <span className="text-2xl font-bold text-purple-600">
                {completedProjects}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-background shadow-md rounded-lg">
              <span className="text-sm font-medium">Recaudado este mes</span>
              <span className="text-2xl font-bold text-emerald-600">
                {formatCurrency(totalDonatedThisMonth)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
