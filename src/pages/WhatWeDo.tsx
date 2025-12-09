import { Link } from 'react-router-dom';
import { Target, BookOpen, Heart, Apple, Trophy, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import CTA from '@/components/CTA';

const QueHacemosPage = () => {
  const { t } = useLanguage();

  const activities = [
    {
      icon: Target,
      title: t.whatWeDo.training.title,
      description: t.whatWeDo.training.description,
      imagePlaceholder: 'Imagen de entrenamiento deportivo',
    },
    {
      icon: BookOpen,
      title: t.whatWeDo.education.title,
      description: t.whatWeDo.education.description,
      imagePlaceholder: 'Imagen de apoyo académico',
    },
    {
      icon: Heart,
      title: t.whatWeDo.values.title,
      description: t.whatWeDo.values.description,
      imagePlaceholder: 'Imagen de formación en valores',
    },
    {
      icon: Apple,
      title: t.whatWeDo.nutrition.title,
      description: t.whatWeDo.nutrition.description,
      imagePlaceholder: 'Imagen de programa de nutrición',
    },
    {
      icon: Trophy,
      title: t.whatWeDo.tournaments.title,
      description: t.whatWeDo.tournaments.description,
      imagePlaceholder: 'Imagen de participación en torneos',
    },
    {
      icon: Users,
      title: t.whatWeDo.community.title,
      description: t.whatWeDo.community.description,
      imagePlaceholder: 'Imagen de trabajo comunitario',
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            {t.whatWeDo.title}
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
            {t.whatWeDo.subtitle}
          </p>
        </div>
      </section>

      {/* Activities Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activities.map((activity, index) => (
              <Card key={index} className="overflow-hidden group hover:shadow-lg transition-all">
                <div className="relative h-64 overflow-hidden bg-muted/30 flex items-center justify-center">
                  {/* Placeholder for image */}
                  <div className="text-center p-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <activity.icon className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground italic">
                      {activity.imagePlaceholder}
                    </p>
                  </div>
                  {/* Image will go here - replace the div above with: */}
                  {/* <img 
                    src="/path/to/image.jpg" 
                    alt={activity.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  /> */}
                </div>
                <CardHeader>
                  <CardTitle className="text-xl text-foreground flex items-center gap-3">
                    <activity.icon className="w-6 h-6 text-primary" />
                    {activity.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {activity.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Image Section 1 - Main Activity */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative h-96 overflow-hidden rounded-lg bg-muted/30 flex items-center justify-center">
              {/* Placeholder for main image */}
              <div className="text-center p-8">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-12 h-12 text-primary" />
                </div>
                <p className="text-lg text-muted-foreground italic">
                  Imagen principal de actividades de la fundación
                </p>
              </div>
              {/* Image will go here - replace the div above with: */}
              {/* <img 
                src="/path/to/main-image.jpg" 
                alt="Actividades de la fundación"
                className="w-full h-full object-cover"
              /> */}
            </div>
          </div>
        </div>
      </section>

      {/* Image Section 2 - Community Impact */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="relative h-80 overflow-hidden rounded-lg bg-muted/30 flex items-center justify-center">
              {/* Placeholder for image */}
              <div className="text-center p-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Heart className="w-10 h-10 text-secondary" />
                </div>
                <p className="text-sm text-muted-foreground italic">
                  Imagen de impacto comunitario
                </p>
              </div>
              {/* Image will go here - replace the div above with: */}
              {/* <img 
                src="/path/to/community-image.jpg" 
                alt="Impacto comunitario"
                className="w-full h-full object-cover"
              /> */}
            </div>
            <div className="relative h-80 overflow-hidden rounded-lg bg-muted/30 flex items-center justify-center">
              {/* Placeholder for image */}
              <div className="text-center p-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground italic">
                  Imagen de logros y reconocimientos
                </p>
              </div>
              {/* Image will go here - replace the div above with: */}
              {/* <img 
                src="/path/to/achievements-image.jpg" 
                alt="Logros y reconocimientos"
                className="w-full h-full object-cover"
              /> */}
            </div>
          </div>
        </div>
      </section>

      <CTA />
    </div>
  );
};

export default QueHacemosPage;

