import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface DonationsUsageSectionProps {
  projectsImageUrl: string | null;
  impactImageUrl: string | null;
}

export const DonationsUsageSection = ({ projectsImageUrl, impactImageUrl }: DonationsUsageSectionProps) => {
  const { t } = useLanguage();

  const renderPlaceholder = (label: string) => (
    <div className="text-center p-4">
      <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-muted-foreground/60" />
      <p className="text-sm text-muted-foreground italic">{label}</p>
    </div>
  );

  const usageItems = [
    { image: projectsImageUrl, item: t.home.donationsUsage.items.equipment },
    { image: projectsImageUrl, item: t.home.donationsUsage.items.tournaments },
    { image: projectsImageUrl, item: t.home.donationsUsage.items.projects },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t.home.donationsUsage.title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t.home.donationsUsage.subtitle}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {usageItems.map(({ image, item }) => (
            <Card key={item.title} className="overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative h-56 overflow-hidden bg-muted/30 flex items-center justify-center">
                {image ? (
                  <img src={image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : renderPlaceholder(item.title)}
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="relative h-64 rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center">
              {impactImageUrl ? (
                <img src={impactImageUrl} alt={t.home.donationsUsage.communityAlt} className="w-full h-full object-cover" />
              ) : renderPlaceholder(t.home.donationsUsage.communityAlt)}
            </div>
            <div>
              <p className="text-lg text-foreground leading-relaxed mb-3">
                <span className="font-bold text-primary">{t.home.donationsUsage.bottomStart}</span>{t.home.donationsUsage.bottomEnd}
              </p>
              <p className="text-sm text-muted-foreground">{t.home.donationsUsage.transparency}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
