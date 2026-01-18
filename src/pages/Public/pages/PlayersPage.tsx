import { useState } from 'react';
import { Search, Filter, Trophy, Target, Zap, Medal, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import CTA from '@/components/CTA';

interface Player {
  id: number;
  name: string;
  age: number;
  category: string;
  position: string;
  image: string;
  tournaments: number;
  goals: number;
  assists: number;
  progress: number;
  joinDate: string;
  attitude: string;
  achievements: string[];
}

const PlayersPage = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const players: Player[] = [
    {
      id: 1,
      name: 'Santiago López',
      age: 14,
      category: 'Categoria 3',
      position: 'Delantero',
      image: 'public/image1.jpg',
      tournaments: 12,
      goals: 23,
      assists: 8,
      progress: 85,
      joinDate: '2020-03-15',
      attitude: 'Excelente',
      achievements: ['Goleador del torneo municipal 2023', 'Mejor jugador sub-14', 'Convocado a selección departamental'],
    },
    {
      id: 2,
      name: 'Mario García',
      age: 12,
      category: 'Categoria 3',
      position: 'Mediocampista',
      image: 'public/image2.jpg',
      tournaments: 8,
      goals: 15,
      assists: 22,
      progress: 78,
      joinDate: '2021-01-10',
      attitude: 'Muy buena',
      achievements: ['Mejor asistidora 2023', 'Premio al juego limpio'],
    },
    {
      id: 3,
      name: 'Andrés Rodríguez',
      age: 16,
      category: 'Categoria 5',
      position: 'Portero',
      image: 'public/image3.jpg',
      tournaments: 15,
      goals: 0,
      assists: 2,
      progress: 92,
      joinDate: '2019-06-20',
      attitude: 'Excelente',
      achievements: ['Portero menos goleado 2023', 'Capitán del equipo', 'En pruebas con club profesional'],
    },
    {
      id: 4,
      name: 'Valentina Torres',
      age: 10,
      category: 'Categoria 2',
      position: 'Defensa',
      image: 'public/image6.jpg',
      tournaments: 5,
      goals: 3,
      assists: 5,
      progress: 65,
      joinDate: '2022-02-28',
      attitude: 'Muy buena',
      achievements: ['Mejor defensa torneo local', 'Premio al esfuerzo'],
    },
    {
      id: 5,
      name: 'Juan Pablo Méndez',
      age: 8,
      category: 'Categoria 1',
      position: 'Mediocampista',
      image: 'public/image4.jpg',
      tournaments: 3,
      goals: 7,
      assists: 4,
      progress: 55,
      joinDate: '2023-01-15',
      attitude: 'Buena',
      achievements: ['Jugador revelación 2023'],
    },
    {
      id: 6,
      name: 'Martin Jiménez',
      age: 15,
      category: 'Categoria 5',
      position: 'Delantero',
      image: 'public/image5.jpg',
      tournaments: 14,
      goals: 28,
      assists: 12,
      progress: 88,
      joinDate: '2020-08-05',
      attitude: 'Excelente',
      achievements: ['Máxima goleadora histórica', 'Selección nacional sub-15', 'Premio talento deportivo'],
    },
  ];

  const categories = ['all', 'Categoria 1', 'Categoria 2', 'Categoria 3', 'Categoria 4', 'Categoria 5'];

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || player.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            {t.players.title}
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
            {t.players.subtitle}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar jugador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'Todas las categorías' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Players Grid */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlayers.map((player) => (
              <Card 
                key={player.id} 
                className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => setSelectedPlayer(player)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={player.image} 
                    alt={player.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                  <Badge className="absolute top-3 right-3 bg-primary">
                    {player.category}
                  </Badge>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-bold text-xl text-primary-foreground">{player.name}</h3>
                    <p className="text-primary-foreground/80">{player.position} • {player.age} años</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <Trophy className="w-5 h-5 mx-auto mb-1 text-primary" />
                      <div className="font-bold text-foreground">{player.tournaments}</div>
                      <div className="text-xs text-muted-foreground">{t.players.tournaments}</div>
                    </div>
                    <div className="text-center">
                      <Target className="w-5 h-5 mx-auto mb-1 text-secondary" />
                      <div className="font-bold text-foreground">{player.goals}</div>
                      <div className="text-xs text-muted-foreground">{t.players.goals}</div>
                    </div>
                    <div className="text-center">
                      <Zap className="w-5 h-5 mx-auto mb-1 text-chart-1" />
                      <div className="font-bold text-foreground">{player.assists}</div>
                      <div className="text-xs text-muted-foreground">{t.players.assists}</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{t.players.progress}</span>
                      <span className="font-medium text-foreground">{player.progress}%</span>
                    </div>
                    <Progress value={player.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPlayers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No se encontraron jugadores</p>
            </div>
          )}
        </div>
      </section>

      {/* Player Detail Modal */}
      <Dialog open={!!selectedPlayer} onOpenChange={() => setSelectedPlayer(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedPlayer && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedPlayer.name}</DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img 
                    src={selectedPlayer.image} 
                    alt={selectedPlayer.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <Badge className="mb-2">{selectedPlayer.category}</Badge>
                    <p className="text-muted-foreground">{selectedPlayer.position} • {selectedPlayer.age} años</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                      <div className="font-bold text-xl text-foreground">{selectedPlayer.tournaments}</div>
                      <div className="text-xs text-muted-foreground">Torneos</div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                      <div className="font-bold text-xl text-foreground">{selectedPlayer.goals}</div>
                      <div className="text-xs text-muted-foreground">Goles</div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                      <div className="font-bold text-xl text-foreground">{selectedPlayer.assists}</div>
                      <div className="text-xs text-muted-foreground">Asistencias</div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                      <div className="font-bold text-xl text-foreground">{selectedPlayer.attitude}</div>
                      <div className="text-xs text-muted-foreground">Actitud</div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progreso general</span>
                      <span className="font-medium text-foreground">{selectedPlayer.progress}%</span>
                    </div>
                    <Progress value={selectedPlayer.progress} className="h-3" />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Medal className="w-5 h-5 text-secondary" />
                  Logros y reconocimientos
                </h4>
                <ul className="space-y-2">
                  {selectedPlayer.achievements.map((achievement, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-secondary" />
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-sm text-muted-foreground mt-4">
                Miembro desde: {new Date(selectedPlayer.joinDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <CTA />
    </div>
  );
};

export default PlayersPage;
