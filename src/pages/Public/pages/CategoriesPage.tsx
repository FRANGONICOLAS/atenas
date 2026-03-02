import { Trophy, Users, Calendar, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteContentsByKeys } from '@/hooks/useSiteContent';
import CTA from '@/components/CTA';

import { getCategories } from '@/lib/data/categories';

const CategoriesPage = () => {
  const { t } = useLanguage();

  // Dynamic content loading
  const keys = [
    'categories_sub6',
    'categories_sub8',
    'categories_sub10',
    'categories_sub12',
    'categories_sub14',
    'categories_sub16',
    'categories_sub18',
  ];
  const { imageMap } = useSiteContentsByKeys(keys);
  const sub6Url = imageMap['categories_sub6'];
  const sub8Url = imageMap['categories_sub8'];
  const sub10Url = imageMap['categories_sub10'];
  const sub12Url = imageMap['categories_sub12'];
  const sub14Url = imageMap['categories_sub14'];
  const sub16Url = imageMap['categories_sub16'];
  const sub18Url = imageMap['categories_sub18'];

  const renderPlaceholder = (label: string) => (
    <div className="h-full w-full flex items-center justify-center bg-muted/30">
      <p className="text-sm text-muted-foreground italic">{label}</p>
    </div>
  );

  const categories = getCategories(t, {
    sub6: sub6Url,
    sub8: sub8Url,
    sub10: sub10Url,
    sub12: sub12Url,
    sub14: sub14Url,
    sub16: sub16Url,
    sub18: sub18Url,
  });

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
                      renderPlaceholder(t.categories.placeholder)
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
                          <div className="text-xs text-muted-foreground">{t.categories.players}</div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <Star className="w-5 h-5 mx-auto mb-1 text-primary" />
                          <div className="font-bold text-foreground">{category.trainers}</div>
                          <div className="text-xs text-muted-foreground">{t.categories.trainers}</div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <Calendar className="w-5 h-5 mx-auto mb-1 text-primary" />
                          <div className="font-bold text-foreground text-sm">{category.schedule.split(' - ')[1]}</div>
                          <div className="text-xs text-muted-foreground">{t.categories.schedule}</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-2">{t.categories.achievements}:</h4>
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