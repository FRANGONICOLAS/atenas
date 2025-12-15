import { Heart, Target, Eye, Users, Award, Shield, Handshake } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import CTA from '@/components/CTA';

const AboutPage = () => {
  const { t } = useLanguage();

  const values = [
    { icon: Heart, title: 'Pasión', description: 'Amamos lo que hacemos y lo transmitimos a cada joven' },
    { icon: Shield, title: 'Integridad', description: 'Actuamos con honestidad y transparencia en todo momento' },
    { icon: Users, title: 'Trabajo en Equipo', description: 'Creemos en el poder del equipo para lograr grandes metas' },
    { icon: Award, title: 'Excelencia', description: 'Buscamos la mejora continua en cada aspecto' },
    { icon: Handshake, title: 'Compromiso', description: 'Estamos comprometidos con el desarrollo de nuestros jóvenes' },
  ];

  const team = [
    { name: 'Hector Sanchez', role: 'Director General', image: '/hector.jpg' },
    { name: 'Omar', role: 'Director General', image: '/image1.jpg' },
    { name: 'Roberto Silva', role: 'Director Sede Norte', image: '/image2.jpg' },
    { name: 'María Fernández', role: 'Directora Sede Sur', image: '/image3.jpg' },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            {t.about.title}
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
            Somos una fundación deportiva sin ánimo de lucro comprometida con el desarrollo integral de niños y jóvenes a través del fútbol.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">{t.about.mission}</h2>
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {t.about.missionText}
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-secondary">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-secondary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">{t.about.vision}</h2>
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {t.about.visionText}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            {t.about.values}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <value.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            {t.about.structure}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
                <div className="relative h-64 overflow-hidden bg-muted/30">
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
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
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

      {/* History Timeline */}
      <section className="py-20 bg-foreground">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-primary-foreground mb-12">
            Nuestra Historia
          </h2>
          <div className="max-w-3xl mx-auto">
            {[
              { year: '2016', title: 'Fundación', description: 'Iniciamos con 20 niños en un pequeño barrio' },
              { year: '2018', title: 'Primera Sede', description: 'Abrimos nuestra primera sede oficial' },
              { year: '2020', title: 'Expansión', description: 'Llegamos a 200 beneficiarios en 3 sedes' },
              { year: '2023', title: 'Reconocimiento', description: 'Premio nacional al impacto social deportivo' },
            ].map((item, index) => (
              <div key={index} className="flex gap-6 mb-8 last:mb-0">
                <div className="flex-shrink-0 w-20 text-right">
                  <span className="text-2xl font-bold text-primary">{item.year}</span>
                </div>
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-primary" />
                  {index < 3 && <div className="w-0.5 h-full bg-primary/30 mt-2" />}
                </div>
                <div className="pb-8">
                  <h3 className="font-bold text-primary-foreground text-lg">{item.title}</h3>
                  <p className="text-primary-foreground/70">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CTA />
    </div>
  );
};

export default AboutPage;