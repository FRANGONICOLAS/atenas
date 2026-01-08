import { Activity, Calendar, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Event } from '@/types';

interface EventsViewProps {
  events: Event[];
  onEventClick: (event: Event) => void;
  onMarkComplete: (eventId: number) => void;
  onViewCalendar: () => void;
  formatDate: (date: string) => string;
}

const getEventIcon = (type: string) => {
  switch (type) {
    case "training":
      return <Activity className="w-4 h-4" />;
    case "meeting":
      return <Activity className="w-4 h-4" />;
    case "match":
      return <Activity className="w-4 h-4" />;
    case "evaluation":
      return <Activity className="w-4 h-4" />;
    case "tournament":
      return <Activity className="w-4 h-4" />;
    default:
      return <Calendar className="w-4 h-4" />;
  }
};

const getEventColor = (type: string) => {
  switch (type) {
    case "training":
      return "bg-blue-500/10 text-blue-600 border-blue-200";
    case "meeting":
      return "bg-purple-500/10 text-purple-600 border-purple-200";
    case "match":
      return "bg-green-500/10 text-green-600 border-green-200";
    case "evaluation":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-200";
    case "tournament":
      return "bg-red-500/10 text-red-600 border-red-200";
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-200";
  }
};

export const EventsView = ({
  events,
  onEventClick,
  onMarkComplete,
  onViewCalendar,
  formatDate,
}: EventsViewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Próximos Eventos
          </span>
          <Button size="sm" variant="ghost" onClick={onViewCalendar}>
            <Calendar className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.slice(0, 3).map((event) => (
            <div
              key={event.id}
              className={`border-l-4 border-l-primary pl-4 py-3 hover:bg-muted/50 transition-colors rounded-r cursor-pointer ${getEventColor(
                event.type
              )} border`}
              onClick={() => onEventClick(event)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {getEventIcon(event.type)}
                    <h4 className="font-medium text-sm">{event.title}</h4>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(event.date)}</span>
                    <span>•</span>
                    <Clock className="w-3 h-3" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{event.location}</span>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkComplete(event.id);
                  }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button
          className="w-full mt-4"
          variant="outline"
          onClick={onViewCalendar}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Ver Calendario Completo
        </Button>
      </CardContent>
    </Card>
  );
};
