import { Link } from 'react-router-dom';
import { Heart, ArrowRight, Users, Target, DollarSign, Calendar, Trophy, Star, ChevronRight, AlertTriangle, Shield, Sparkles, Activity, Brain, Smile, Handshake, Import } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getHomeImpactStats, getHomeCategories, getHomeFeaturedPlayers } from '@/lib/data/home';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteContentsByKeys } from '@/hooks/useSiteContent';
import CTA from '@/components/CTA';

const HomePage = () => {
  const { t } = useLanguage();
  
  // Dynamic content loading
  const keys = [
    'home_hero',
    'home_problem',
    'home_impact',
    'home_projects',
    'home_transformation_1',
    'home_transformation_2',
    'home_transformation_3',
    'home_transformation_4',
    'home_transformation_5',
    'home_transformation_6',
  ];
  const { imageMap } = useSiteContentsByKeys(keys);

  const heroImageUrl = imageMap['home_hero'];
  const problemUrl = imageMap['home_problem'];
  const impactUrl = imageMap['home_impact'];
  const pruebaUrl = imageMap['home_projects'];
  const transformacion1Url = imageMap['home_transformation_1'];
  const transformacion2Url = imageMap['home_transformation_2'];
  const transformacion3Url = imageMap['home_transformation_3'];
  const transformacion4Url = imageMap['home_transformation_4'];
  const transformacion5Url = imageMap['home_transformation_5'];
  const transformacion6Url = imageMap['home_transformation_6'];

  const renderPlaceholder = (
    label: string,
    iconClassName = 'w-10 h-10',
    textClassName = 'text-sm',
  ) => (
    <div className="text-center p-4">
      <AlertTriangle className={`${iconClassName} mx-auto mb-2 text-muted-foreground/60`} />
      <p className={`${textClassName} text-muted-foreground italic`}>{label}</p>
    </div>
  );

  const impactStats = getHomeImpactStats(t);
  const categories = getHomeCategories(t);
  const featuredPlayers = getHomeFeaturedPlayers(t);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {heroImageUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${heroImageUrl})` }}
            />
          ) : (
            <div className="absolute inset-0 bg-muted/30" />
          )}
          {!heroImageUrl && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {renderPlaceholder('Imagen de portada', 'w-14 h-14', 'text-base')}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/50" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              {t.home.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl">
              {t.home.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/donar">
                <Button size="lg" className="w-full sm:w-auto gap-2 text-base">
                  <Heart className="w-5 h-5" />
                  {t.home.donateNow}
                </Button>
              </Link>
              <Link to="/quienes-somos">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 text-base bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground">
                  {t.home.learnMore}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      
      {/* Problem Section */}
      <section className="py-20 bg-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              {t.home.problem.title}
            </h2>
            <p className="text-primary-foreground/80 max-w-3xl mx-auto text-lg leading-relaxed mb-4">
              {t.home.problem.description1}
            </p>
            <p className="text-primary-foreground/70 max-w-3xl mx-auto leading-relaxed">
              {t.home.problem.description2}
            </p>
          </div>
          
          {/* Image Grid */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-8">
            <div className="relative h-64 rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center">
              {problemUrl ? (
                <img
                  src={problemUrl}
                  alt="Problemática de la comunidad"
                  className="w-full h-full object-cover"
                />
              ) : (
                renderPlaceholder('Imagen de la problemática')
              )}
            </div>
            <div className="relative h-64 rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center">
              {impactUrl ? (
                <img
                  src={impactUrl}
                  alt="Impacto en jóvenes"
                  className="w-full h-full object-cover"
                />
              ) : (
                renderPlaceholder('Imagen de impacto')
              )}
            </div>
          </div>

          {/* Problem Details */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-card/50 border-primary/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-primary-foreground mb-3">{t.home.problem.problemTitle}</h3>
                  <ul className="space-y-2 text-primary-foreground/80 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 flex-shrink-0" />
                      <span>{t.home.problem.problemList.p1}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 flex-shrink-0" />
                      <span>{t.home.problem.problemList.p2}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 flex-shrink-0" />
                      <span>{t.home.problem.problemList.p3}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 flex-shrink-0" />
                      <span>{t.home.problem.problemList.p4}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-primary/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-primary-foreground mb-3">{t.home.problem.impactTitle}</h3>
                  <ul className="space-y-2 text-primary-foreground/80 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0" />
                      <span>{t.home.problem.impactList.i1}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0" />
                      <span>{t.home.problem.impactList.i2}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0" />
                      <span>{t.home.problem.impactList.i3}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0" />
                      <span>{t.home.problem.impactList.i4}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Stats */}
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

      {/* How Sport Helps Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t.home.transformation.title}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t.home.transformation.subtitle}
            </p>
          </div>

          {/* Main Image */}

          {/* Benefits Grid with Images */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative h-48 overflow-hidden bg-muted/30 flex items-center justify-center">
                {transformacion1Url ? (
                  <img
                    src={transformacion1Url}
                    alt={t.home.transformation.items.belonging.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  renderPlaceholder(t.home.transformation.items.belonging.title)
                )}
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-foreground mb-1">{t.home.transformation.items.belonging.title}</h3>
                <p className="text-xs text-muted-foreground">{t.home.transformation.items.belonging.desc}</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative h-48 overflow-hidden bg-muted/30 flex items-center justify-center">
                {transformacion2Url ? (
                  <img
                    src={transformacion2Url}
                    alt={t.home.transformation.items.emotions.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  renderPlaceholder(t.home.transformation.items.emotions.title)
                )}
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-foreground mb-1">{t.home.transformation.items.emotions.title}</h3>
                <p className="text-xs text-muted-foreground">{t.home.transformation.items.emotions.desc}</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative h-48 overflow-hidden bg-muted/30 flex items-center justify-center">
                {transformacion3Url ? (
                  <img
                    src={transformacion3Url}
                    alt={t.home.transformation.items.health.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  renderPlaceholder(t.home.transformation.items.health.title)
                )}
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-foreground mb-1">{t.home.transformation.items.health.title}</h3>
                <p className="text-xs text-muted-foreground">{t.home.transformation.items.health.desc}</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative h-48 overflow-hidden bg-muted/30 flex items-center justify-center">
                {transformacion4Url ? (
                  <img
                    src={transformacion4Url}
                    alt={t.home.transformation.items.discipline.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  renderPlaceholder(t.home.transformation.items.discipline.title)
                )}
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-foreground mb-1">{t.home.transformation.items.discipline.title}</h3>
                <p className="text-xs text-muted-foreground">{t.home.transformation.items.discipline.desc}</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative h-48 overflow-hidden bg-muted/30 flex items-center justify-center">
                {transformacion5Url ? (
                  <img
                    src={transformacion5Url}
                    alt={t.home.transformation.items.teamwork.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  renderPlaceholder(t.home.transformation.items.teamwork.title)
                )}
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-foreground mb-1">{t.home.transformation.items.teamwork.title}</h3>
                <p className="text-xs text-muted-foreground">{t.home.transformation.items.teamwork.desc}</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative h-48 overflow-hidden bg-muted/30 flex items-center justify-center">
                {transformacion6Url ? (
                  <img
                    src={transformacion6Url}
                    alt={t.home.transformation.items.future.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  renderPlaceholder(t.home.transformation.items.future.title)
                )}
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-foreground mb-1">{t.home.transformation.items.future.title}</h3>
                <p className="text-xs text-muted-foreground">{t.home.transformation.items.future.desc}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What Donations Do Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t.home.donationsUsage.title}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t.home.donationsUsage.subtitle}
            </p>
          </div>

          {/* Activities Grid with Images */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative h-56 overflow-hidden bg-muted/30 flex items-center justify-center">
                {pruebaUrl ? (
                  <img
                    src={pruebaUrl}
                    alt={t.home.donationsUsage.items.equipment.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  renderPlaceholder(t.home.donationsUsage.items.equipment.title)
                )}
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-foreground mb-1">{t.home.donationsUsage.items.equipment.title}</h3>
                <p className="text-xs text-muted-foreground">{t.home.donationsUsage.items.equipment.desc}</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative h-56 overflow-hidden bg-muted/30 flex items-center justify-center">
                {pruebaUrl ? (
                  <img
                    src={pruebaUrl}
                    alt={t.home.donationsUsage.items.tournaments.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  renderPlaceholder(t.home.donationsUsage.items.tournaments.title)
                )}
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-foreground mb-1">{t.home.donationsUsage.items.tournaments.title}</h3>
                <p className="text-xs text-muted-foreground">{t.home.donationsUsage.items.tournaments.desc}</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative h-56 overflow-hidden bg-muted/30 flex items-center justify-center">
                {pruebaUrl ? (
                  <img
                    src={pruebaUrl}
                    alt={t.home.donationsUsage.items.projects.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  renderPlaceholder(t.home.donationsUsage.items.projects.title)
                )}
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-foreground mb-1">{t.home.donationsUsage.items.projects.title}</h3>
                <p className="text-xs text-muted-foreground">{t.home.donationsUsage.items.projects.desc}</p>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Message with Image */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="relative h-64 rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center">
                {impactUrl ? (
                  <img
                    src={impactUrl}
                    alt={t.home.donationsUsage.communityAlt}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  renderPlaceholder(t.home.donationsUsage.communityAlt)
                )}
              </div>
              <div>
                <p className="text-lg text-foreground leading-relaxed mb-3">
                  <span className="font-bold text-primary">{t.home.donationsUsage.bottomStart}</span>{t.home.donationsUsage.bottomEnd}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t.home.donationsUsage.transparency}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      

      <CTA />
    </div>
  );
};

export default HomePage;
