import { Link } from 'react-router-dom';
import { Heart, ArrowRight, Users, Target, DollarSign, Calendar, Trophy, Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import heroImage from '@/assets/hero-soccer.jpg';

const HomePage = () => {
  const { t } = useLanguage();

  const impactStats = [
    { icon: Users, value: '200+', label: t.home.beneficiaries },
    { icon: Target, value: '12', label: t.home.projects },
    { icon: DollarSign, value: '$50K+', label: t.home.donations },
    { icon: Calendar, value: '10', label: t.home.years },
  ];

  const categories = [
    { age: '6-8', name: 'Categoria 1', players: 45 },
    { age: '8-10', name: 'Categoria 2', players: 52 },
    { age: '10-12', name: 'Categoria 3', players: 48 },
    { age: '12-15', name: 'Categoria 4', players: 60 },
    { age: '15-17', name: 'Categoria 5', players: 38 },
  ];

  const featuredPlayers = [
    { name: 'Santiago López', age: 14, position: 'Delantero', goals: 23, image: 'public/image1.jpg' },
    { name: 'Mario García', age: 12, position: 'Mediocampista', goals: 15, image: 'public/image2.jpg' },
    { name: 'Andrés Rodríguez', age: 16, position: 'Portero', goals: 0, image: 'public/image3.jpg' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
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
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 text-base bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
                  {t.home.learnMore}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-primary-foreground/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-primary-foreground mb-12">
            {t.home.impactTitle}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {impactStats.map((stat, index) => (
              <div 
                key={index}
                className="text-center p-6 rounded-xl bg-primary-foreground/10 backdrop-blur-sm"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary-foreground" />
                <div className="text-3xl md:text-4xl font-bold text-primary-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-primary-foreground/80">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t.categories.title}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t.categories.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                    <Trophy className="w-8 h-8 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-1">{category.name}</h3>
                  <p className="text-2xl font-bold text-primary">{category.age}</p>
                  <p className="text-sm text-muted-foreground">{t.categories.age}</p>
                  <p className="text-xs text-muted-foreground mt-2">{category.players} jugadores</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/categorias">
              <Button variant="outline" className="gap-2">
                Ver todas las categorías
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Players */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t.players.title}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t.players.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPlayers.map((player, index) => (
              <Card key={index} className="group overflow-hidden hover:shadow-xl transition-all">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={player.image} 
                    alt={player.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-bold text-xl text-primary-foreground">{player.name}</h3>
                    <p className="text-primary-foreground/80">{player.position} • {player.age} años</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-secondary" />
                      <span className="font-bold text-foreground">{player.goals} {t.players.goals}</span>
                    </div>
                    <Link to="/jugadores">
                      <Button variant="ghost" size="sm" className="gap-1">
                        Ver perfil
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/jugadores">
              <Button className="gap-2">
                Ver todos los jugadores
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-foreground mb-6">
            ¿Quieres ser parte del cambio?
          </h2>
          <p className="text-secondary-foreground/80 max-w-2xl mx-auto mb-8 text-lg">
            Tu donación puede transformar la vida de un joven a través del deporte. Cada aporte cuenta para construir un futuro mejor.
          </p>
          <Link to="/donar">
            <Button size="lg" variant="default" className="gap-2 bg-foreground text-primary-foreground hover:bg-foreground/90">
              <Heart className="w-5 h-5" />
              {t.home.donateNow}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
