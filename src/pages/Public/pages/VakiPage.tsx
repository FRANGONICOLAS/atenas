import {
  Heart,
  Users,
  School,
  Home as HomeIcon,
  Trophy,
  ExternalLink,
  Package,
  HeartHandshake,
  HeartPulse,
  Wrench,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { VAKI_URL } from '@/lib/data/vaki';

const VakiPage = () => {
  const { t } = useLanguage();

  const facts = t.vaki.hero.facts.rows;

  const commitmentItems = [
    { icon: Heart, text: t.vaki.commitment.items.p1 },
    { icon: School, text: t.vaki.commitment.items.p2 },
    { icon: HomeIcon, text: t.vaki.commitment.items.p3 },
    { icon: Trophy, text: t.vaki.commitment.items.p4 },
  ];

  const fundsItems = [
    { icon: Package, text: t.vaki.useOfFunds.items.p1 },
    { icon: HeartHandshake, text: t.vaki.useOfFunds.items.p2 },
    { icon: HeartPulse, text: t.vaki.useOfFunds.items.p3 },
    { icon: Wrench, text: t.vaki.useOfFunds.items.p4 },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-secondary text-secondary-foreground">
            {t.vaki.hero.eyebrow}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6 max-w-4xl mx-auto">
            {t.vaki.hero.title}
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto mb-8">
            {t.vaki.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={VAKI_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="secondary" className="gap-2">
                <Heart className="w-5 h-5" />
                {t.vaki.hero.primaryCta}
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
            <a href="#como-se-usa">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
              >
                {t.vaki.hero.secondaryCta}
              </Button>
            </a>
          </div>
          <p className="text-primary-foreground/70 text-sm mt-4">
            {t.vaki.hero.vakiNote}
          </p>
        </div>
      </section>

      {/* Hechos de la emergencia */}
      <section className="py-12 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
            {facts.map((fact) => (
              <div key={fact.label} className="text-center">
                <p className="text-xl md:text-2xl font-bold text-primary mb-1">
                  {fact.value}
                </p>
                <p className="text-sm text-muted-foreground">{fact.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contexto */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-8">
            {t.vaki.context.title}
          </h2>
          <div className="space-y-5 text-lg text-muted-foreground leading-relaxed">
            <p>{t.vaki.context.p1}</p>
            <p>{t.vaki.context.p2}</p>
          </div>
          <p className="mt-8 text-center text-xs text-muted-foreground/70">
            {t.vaki.context.sources}
          </p>
        </div>
      </section>

      {/* Compromiso */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t.vaki.commitment.title}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {t.vaki.commitment.subtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {commitmentItems.map(({ icon: Icon, text }, index) => (
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

      {/* Uso de fondos */}
      <section id="como-se-usa" className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            {t.vaki.useOfFunds.title}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {fundsItems.map(({ icon: Icon, text }, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-5"
              >
                <Icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-foreground mb-4 max-w-2xl mx-auto">
            {t.vaki.cta.title}
          </h2>
          <p className="text-secondary-foreground/80 max-w-2xl mx-auto mb-8 text-lg">
            {t.vaki.cta.description}
          </p>
          <a href={VAKI_URL} target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              className="gap-2 bg-foreground text-primary-foreground hover:bg-foreground/90"
            >
              <Heart className="w-5 h-5" />
              {t.vaki.cta.button}
              <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
          <p className="text-secondary-foreground/70 text-sm mt-4">
            {t.vaki.cta.externalNote}
          </p>
          <p className="text-secondary-foreground/60 text-sm mt-2">
            {t.vaki.cta.transparency}
          </p>
        </div>
      </section>
    </div>
  );
};

export default VakiPage;
