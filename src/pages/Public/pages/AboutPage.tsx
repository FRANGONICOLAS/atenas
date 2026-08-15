import { Target, Eye, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteContentsByKeys } from '@/hooks/useSiteContent';
import CTA from '@/components/CTA';

import { getAboutTeam } from '@/lib/data/about';

const AboutPage = () => {
  const { t } = useLanguage();

  const keys = ['about_hero','about_team_1','about_team_2','about_team_3','about_team_4'];
  const { imageMap } = useSiteContentsByKeys(keys);

  const aboutHeroUrl = imageMap['about_hero'];
  const team1Url = imageMap['about_team_1'];
  const team2Url = imageMap['about_team_2'];
  const team3Url = imageMap['about_team_3'];
  const team4Url = imageMap['about_team_4'];

  const team = getAboutTeam(t, {
    team1: team1Url,
    team2: team2Url,
  });

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="relative py-20 bg-primary overflow-hidden">
        {aboutHeroUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${aboutHeroUrl})` }}
          >
            <div className="absolute inset-0 bg-primary/80" />
          </div>
        ) : null}
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            {t.about.title}
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
            {t.about.subtitle}
          </p>
        </div>
      </section>

      {/* Description */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-center">
              {t.about.description}
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">{t.about.mission}</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {t.about.missionText}
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-secondary">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-secondary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">{t.about.vision}</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {t.about.visionText}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 items-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {t.about.structure}
          </h2>
          <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="w-full max-w-sm overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 md:w-[320px]">
                <div className="relative h-64 overflow-hidden bg-muted/30 flex items-center justify-center">
                  {member.image ? (
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                        target.onerror = null;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <CardContent className="p-6 text-center bg-card">
                  <h3 className="font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </div>
  );
};

export default AboutPage;
