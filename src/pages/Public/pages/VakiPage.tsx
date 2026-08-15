import { Heart, Users, School, Home as HomeIcon, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { VAKI_URL } from '@/lib/data/vaki';

const VakiPage = () => {
  const { t } = useLanguage();

  const missionPoints = [
    { icon: Heart, text: t.vaki.mission.points.p1 },
    { icon: School, text: t.vaki.mission.points.p2 },
    { icon: HomeIcon, text: t.vaki.mission.points.p3 },
    { icon: Users, text: t.vaki.mission.points.p4 },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-secondary text-secondary-foreground">
            {t.vaki.hero.badge}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6 max-w-4xl mx-auto">
            {t.vaki.hero.title}
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto mb-8">
            {t.vaki.hero.subtitle}
          </p>
          <a href={VAKI_URL} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="gap-2">
              <Heart className="w-5 h-5" />
              {t.vaki.cta.button}
              <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </section>

      {/* Contexto */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-8">
            {t.vaki.context.title}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            {t.vaki.context.description1}
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t.vaki.context.description2}
          </p>
        </div>
      </section>

      {/* Misión */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            {t.vaki.mission.title}
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            {t.vaki.mission.description}
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {missionPoints.map(({ icon: Icon, text }, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-foreground font-medium">{text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-foreground mb-4">
            {t.vaki.cta.title}
          </h2>
          <p className="text-secondary-foreground/80 max-w-2xl mx-auto mb-8 text-lg">
            {t.vaki.cta.description}
          </p>
          <a href={VAKI_URL} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="gap-2">
              <Heart className="w-5 h-5" />
              {t.vaki.cta.button}
            </Button>
          </a>
          <p className="text-secondary-foreground/60 text-sm mt-4">
            {t.vaki.cta.externalNote}
          </p>
        </div>
      </section>
    </div>
  );
};

export default VakiPage;
