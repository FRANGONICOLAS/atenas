import { Card, CardContent } from '@/components/ui/card';

interface SiteContentStatsProps {
  stats: {
    total: number;
    active: number;
    photos: number;
    videos: number;
  };
}

export const SiteContentStats = ({ stats }: SiteContentStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="text-2xl font-bold text-foreground mb-1">{stats.total}</div>
          <p className="text-sm text-muted-foreground">Total de Contenidos</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="text-2xl font-bold text-green-600 mb-1">{stats.active}</div>
          <p className="text-sm text-muted-foreground">Contenidos Activos</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="text-2xl font-bold text-foreground mb-1">{stats.photos}</div>
          <p className="text-sm text-muted-foreground">Fotos</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="text-2xl font-bold text-foreground mb-1">{stats.videos}</div>
          <p className="text-sm text-muted-foreground">Videos</p>
        </CardContent>
      </Card>
    </div>
  );
};
