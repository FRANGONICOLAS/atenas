import { Calendar as CalendarIcon, Clock, MapPin, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import type { Event } from '@/types';

interface CalendarDialogProps {
  isOpen: boolean;
  onClose: () => void;
  events: Event[];
  onDeleteEvent: (eventId: number) => void;
  formatDate: (date: string) => string;
}

const getEventTypeBadge = (type: string) => {
  const typeMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    training: { label: 'Entrenamiento', variant: 'default' },
    match: { label: 'Partido', variant: 'default' },
    meeting: { label: 'Reunión', variant: 'secondary' },
    evaluation: { label: 'Evaluación', variant: 'outline' },
    tournament: { label: 'Torneo', variant: 'destructive' },
  };
  const config = typeMap[type] || { label: type, variant: 'default' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const CalendarDialog = ({
  isOpen,
  onClose,
  events,
  onDeleteEvent,
  formatDate,
}: CalendarDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Filtrar eventos para la fecha seleccionada
  const selectedDateStr = selectedDate?.toISOString().split('T')[0];
  const eventsForSelectedDate = events.filter(
    (event) => event.date === selectedDateStr
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Calendario de Eventos
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calendario */}
          <div className="space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </div>

          {/* Eventos del día seleccionado */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Eventos para {selectedDate ? formatDate(selectedDateStr!) : 'Hoy'}
              </h3>
              {eventsForSelectedDate.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No hay eventos programados para esta fecha</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {eventsForSelectedDate.map((event) => (
                    <div
                      key={event.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{event.title}</h4>
                          {getEventTypeBadge(event.type)}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onDeleteEvent(event.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      {event.description && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
