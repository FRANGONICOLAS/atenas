import { Trophy, Users, Calendar, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteContent } from '@/hooks/useSiteContent';
import CTA from '@/components/CTA';

const CategoriesPage = () => {
  const { t } = useLanguage();

  const { imageUrl: sub6Url } = useSiteContent('categories_sub6');
  const { imageUrl: sub8Url } = useSiteContent('categories_sub8');
  const { imageUrl: sub10Url } = useSiteContent('categories_sub10');
  const { imageUrl: sub12Url } = useSiteContent('categories_sub12');
  const { imageUrl: sub14Url } = useSiteContent('categories_sub14');
  const { imageUrl: sub16Url } = useSiteContent('categories_sub16');
  const { imageUrl: sub18Url } = useSiteContent('categories_sub18');

  const renderPlaceholder = (label: string) => (
    <div className="h-full w-full flex items-center justify-center bg-muted/30">
      <p className="text-sm text-muted-foreground italic">{label}</p>
    </div>
  );

  const categories = [
    {
      name: 'Categoria Sub 6',
      ageRange: '6-8',
      players: 45,
      trainers: 3,
      schedule: 'Lunes, Miércoles, Viernes - 3:00 PM',
      description: 'Iniciación al fútbol a través del juego. Desarrollo de habilidades motoras básicas y trabajo en equipo.',
      achievements: ['Participación en 5 torneos locales', 'Formación de 15 jugadores para categoría superior'],
      image: sub6Url,
      color: 'bg-chart-1',
    },
    {
      name: 'Categoria Sub 8',
      ageRange: '6-8',
      players: 45,
      trainers: 3,
      schedule: 'Lunes, Miércoles, Viernes - 3:00 PM',
      description: 'Iniciación al fútbol a través del juego. Desarrollo de habilidades motoras básicas y trabajo en equipo.',
      achievements: ['Participación en 5 torneos locales', 'Formación de 15 jugadores para categoría superior'],
      image: sub8Url,
      color: 'bg-chart-1',
    },
    {
      name: 'Categoria Sub 10',
      ageRange: '8-10',
      players: 52,
      trainers: 4,
      schedule: 'Martes, Jueves, Sábado - 3:30 PM',
      description: 'Desarrollo de fundamentos técnicos del fútbol. Introducción a tácticas básicas de juego.',
      achievements: ['Campeones torneo municipal 2023', '8 jugadores seleccionados para selección departamental'],
      image: sub10Url,
      color: 'bg-chart-2',
    },
    {
      name: 'Categoria Sub 12',
      ageRange: '10-12',
      players: 48,
      trainers: 4,
      schedule: 'Lunes a Viernes - 4:00 PM',
      description: 'Perfeccionamiento técnico y táctico. Desarrollo de la visión de juego y posicionamiento.',
      achievements: ['Subcampeones liga regional', '12 convocados a pruebas de clubes profesionales'],
      image: sub12Url,
      color: 'bg-chart-3',
    },
    {
      name: 'Categoria Sub 14',
      ageRange: '12-14',
      players: 60,
      trainers: 5,
      schedule: 'Lunes a Sábado - 4:30 PM',
      description: 'Especialización por posición. Preparación física específica y desarrollo mental.',
      achievements: ['Participación en torneos nacionales', '5 jugadores fichados por academias profesionales'],
      image: sub14Url,
      color: 'bg-chart-4',
    },
    {
      name: 'Categoria Sub 16',
      ageRange: '15-17',
      players: 38,
      trainers: 3,
      schedule: 'Lunes a Sábado - 5:00 PM',
      description: 'Alto rendimiento y preparación para el fútbol profesional. Formación integral del deportista.',
      achievements: ['3 jugadores en divisiones inferiores de clubes profesionales', 'Campeones nacionales sub-17'],
      image: sub16Url,
      color: 'bg-chart-5',
    },
    {
      name: 'Categoria Sub 18',
      ageRange: '15-17',
      players: 38,
      trainers: 3,
      schedule: 'Lunes a Sábado - 5:00 PM',
      description: 'Alto rendimiento y preparación para el fútbol profesional. Formación integral del deportista.',
      achievements: ['3 jugadores en divisiones inferiores de clubes profesionales', 'Campeones nacionales sub-17'],
      image: sub18Url,
      color: 'bg-chart-5',
    }
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            {t.categories.title}
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
            {t.categories.subtitle}
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="space-y-12">
            {categories.map((category, index) => (
              <Card key={index} className="overflow-hidden">
                <div className={`grid md:grid-cols-2 gap-0 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                  <div className={`relative h-64 md:h-auto ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      renderPlaceholder('Imagen de categoria')
                    )}
                    <div className="absolute top-4 left-4">
                      <Badge className={`${category.color} text-card text-lg px-4 py-2`}>
                        {category.ageRange} {t.categories.age}
                      </Badge>
                    </div>
                  </div>
                  <div className={`p-8 ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                    <CardHeader className="p-0 mb-4">
                      <CardTitle className="text-3xl text-foreground flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-primary" />
                        {category.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <p className="text-muted-foreground mb-6">{category.description}</p>
                      
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                          <div className="font-bold text-foreground">{category.players}</div>
                          <div className="text-xs text-muted-foreground">Jugadores</div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <Star className="w-5 h-5 mx-auto mb-1 text-primary" />
                          <div className="font-bold text-foreground">{category.trainers}</div>
                          <div className="text-xs text-muted-foreground">Entrenadores</div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <Calendar className="w-5 h-5 mx-auto mb-1 text-primary" />
                          <div className="font-bold text-foreground text-sm">{category.schedule.split(' - ')[1]}</div>
                          <div className="text-xs text-muted-foreground">Horario</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Logros destacados:</h4>
                        <ul className="space-y-1">
                          {category.achievements.map((achievement, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <CTA />
    </div>
  );
};

export default CategoriesPage;