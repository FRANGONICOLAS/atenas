export type EventType = 'tournament' | 'training' | 'meeting' | 'other';

export interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  type: EventType;
  description: string;
  participants?: number;
}
