import { Trophy, MapPin, ClipboardList, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  color: string;
}

export const StatCard = ({ icon: Icon, title, value, color }: StatCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-1">{value}</h3>
        <p className="text-sm text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  );
};
