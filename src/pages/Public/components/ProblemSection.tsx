import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProblemSectionProps {
  problemUrl: string | null;
  impactUrl: string | null;
}

export const ProblemSection = ({ problemUrl, impactUrl }: ProblemSectionProps) => {
  const { t } = useLanguage();

  const renderPlaceholder = (label: string) => (
    <div className="text-center p-4">
      <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-muted-foreground/60" />
      <p className="text-sm text-muted-foreground italic">{label}</p>
    </div>
  );

  return (
    <section className="py-20 bg-foreground">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">{t.home.problem.title}</h2>
          <p className="text-primary-foreground/80 max-w-3xl mx-auto text-lg leading-relaxed mb-4">{t.home.problem.description1}</p>
          <p className="text-primary-foreground/70 max-w-3xl mx-auto leading-relaxed">{t.home.problem.description2}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-8">
          <div className="relative h-64 rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center">
            {problemUrl ? <img src={problemUrl} alt="Problemática" className="w-full h-full object-cover" /> : renderPlaceholder('Imagen de la problemática')}
          </div>
          <div className="relative h-64 rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center">
            {impactUrl ? <img src={impactUrl} alt="Impacto" className="w-full h-full object-cover" /> : renderPlaceholder('Imagen de impacto')}
          </div>
        </div>
        <div className="max-w-4xl mx-auto mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card/50 border-primary/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-primary-foreground mb-3">{t.home.problem.problemTitle}</h3>
                <ul className="space-y-2 text-primary-foreground/80 text-sm">
                  {[t.home.problem.problemList.p1, t.home.problem.problemList.p2, t.home.problem.problemList.p3, t.home.problem.problemList.p4].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-primary/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-primary-foreground mb-3">{t.home.problem.impactTitle}</h3>
                <ul className="space-y-2 text-primary-foreground/80 text-sm">
                  {[t.home.problem.impactList.i1, t.home.problem.impactList.i2, t.home.problem.impactList.i3, t.home.problem.impactList.i4].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto text-center">
          <div>
            <div className="text-3xl font-bold text-primary-foreground mb-1">{t.home.problem.stats.rescued.val}</div>
            <div className="text-sm text-primary-foreground/70">{t.home.problem.stats.rescued.label}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-foreground mb-1">{t.home.problem.stats.years.val}</div>
            <div className="text-sm text-primary-foreground/70">{t.home.problem.stats.years.label}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-foreground mb-1">{t.home.problem.stats.zone.val}</div>
            <div className="text-sm text-primary-foreground/70">{t.home.problem.stats.zone.label}</div>
          </div>
        </div>
      </div>
    </section>
  );
};
