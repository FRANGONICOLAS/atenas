import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const AnalyticsView = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Métricas Mensuales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Nuevos Usuarios</span>
              <span className="text-2xl font-bold text-blue-600">+12</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Donaciones Procesadas</span>
              <span className="text-2xl font-bold text-green-600">48</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Proyectos Completados</span>
              <span className="text-2xl font-bold text-purple-600">3</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actividad del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-sm">Sistema funcionando correctamente</div>
                <div className="text-xs text-muted-foreground">Última actualización: Hace 5 min</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-sm">Backup programado</div>
                <div className="text-xs text-muted-foreground">Próximo: Hoy 23:00</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
