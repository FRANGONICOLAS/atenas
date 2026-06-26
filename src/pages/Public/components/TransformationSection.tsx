import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface TransformationSectionProps {
  images: Record<string, string | null>;
}

export const TransformationSection = ({ images }: TransformationSectionProps) => {
  const { t } = useLanguage();

  const renderPlaceholder = (label: string) => (
    <div className="text-center p-4">
      <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-muted-foreground/60" />
      <p className="text-sm text-muted-foreground italic">{label}</p>
    </div>
  );

  const items = [
    { key: 'transformacion1', image: images['home_transformation_1'], item: t.home.transformation.items.belonging },
    { key: 'transformacion2', image: images['home_transformation_2'], item: t.home.transformation.items.emotions },
    { key: 'transformacion3', image: images['home_transformation_3'], item: t.home.transformation.items.health },
    { key: 'transformacion4', image: images['home_transformation_4'], item: t.home.transformation.items.discipline },
    { key: 'transformacion5', image: images['home_transformation_5'], item: t.home.transformation.items.teamwork },
    { key: 'transformacion6', image: images['home_transformation_6'], item: t.home.transformation.items.future },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t.home.transformation.title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t.home.transformation.subtitle}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {items.map(({ key, image, item }) => (
            <Card key={key} className="overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative h-48 overflow-hidden bg-muted/30 flex items-center justify-center">
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
      </div>
    </section>
  );
};
