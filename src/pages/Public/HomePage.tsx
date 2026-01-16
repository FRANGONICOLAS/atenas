import { Link } from 'react-router-dom';
import { Heart, ArrowRight, Users, Target, DollarSign, Calendar, Trophy, Star, ChevronRight, AlertTriangle, Shield, Sparkles, Activity, Brain, Smile, Handshake, Import } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import CTA from '@/components/CTA';
import heroImage from '@/assets/WhatsApp Image 2025-12-11 at 22.10.38.jpeg';
import impacto from '@/assets/WhatsApp Image 2025-12-11 at 22.10.24.jpeg';
import prueba from '@/assets/IMG_5293.JPEG';
import transformacion_1 from '@/assets/IMG_5316.JPEG';
import transformacion_2 from '@/assets/IMG_5317.JPEG';
import transformacion_3 from '@/assets/IMG_5318.JPEG';
import transformacion_4 from '@/assets/IMG_5319.JPEG';
import transformacion_5 from '@/assets/IMG_5322.JPEG';
import transformacion_6 from '@/assets/IMG_5323.JPEG';



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
    { name: 'Santiago López', age: 14, position: 'Delantero', goals: 23, image: '/image1.jpg' },
    { name: 'Mario García', age: 12, position: 'Mediocampista', goals: 15, image: '/image2.jpg' },
    { name: 'Andrés Rodríguez', age: 16, position: 'Portero', goals: 0, image: '/image3.jpg' },
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
              La Realidad que Enfrentamos
            </h2>
            <p className="text-primary-foreground/80 max-w-3xl mx-auto text-lg leading-relaxed mb-4">
              Muchos jóvenes viven en contextos de vulnerabilidad: falta de oportunidades, riesgo de deserción escolar, violencia, adicciones o exclusión social. La ausencia de espacios de recreación y contención social profundiza el problema, dejando a los jóvenes sin alternativas sanas para su tiempo libre.
            </p>
            <p className="text-primary-foreground/70 max-w-3xl mx-auto leading-relaxed">
              En la Comuna 17, aunque está marcada con estrato económico 4 a 5, la mayoría de personas no tienen capacidad adquisitiva para pagar escuelas deportivas. A pesar de vivir en un estrato alto, no hay recursos para acceder a planes deportivos formales, y muchos jóvenes terminan en situaciones de riesgo.
            </p>
          </div>
          
          {/* Image Grid */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-8">
            <div className="relative h-64 rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center">
              <img
                src="/image7.jpg"
                alt="Problemática de la comunidad"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative h-64 rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center">
              <img
                src={impacto}
                alt="Impacto en jóvenes"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Problem Details */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-card/50 border-primary/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-primary-foreground mb-3">El Problema</h3>
                  <ul className="space-y-2 text-primary-foreground/80 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 flex-shrink-0" />
                      <span>Falta de espacios seguros de recreación y formación</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 flex-shrink-0" />
                      <span>Riesgo de deserción escolar y exclusión social</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 flex-shrink-0" />
                      <span>Exposición a violencia, adicciones y bandas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 flex-shrink-0" />
                      <span>Familias sin recursos para escuelas deportivas</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-primary/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-primary-foreground mb-3">Nuestro Impacto</h3>
                  <ul className="space-y-2 text-primary-foreground/80 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0" />
                      <span>35+ jóvenes rescatados de bandas y situaciones de violencia</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0" />
                      <span>10 años trabajando en la Comuna 17</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0" />
                      <span>Jóvenes que han llegado al fútbol profesional</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0" />
                      <span>Transformación de actitudes violentas a través del deporte</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto text-center">
            <div>
              <div className="text-3xl font-bold text-primary-foreground mb-1">35+</div>
              <div className="text-sm text-primary-foreground/70">Jóvenes rescatados</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-foreground mb-1">10</div>
              <div className="text-sm text-primary-foreground/70">Años trabajando</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-foreground mb-1">Comuna 17</div>
              <div className="text-sm text-primary-foreground/70">Zona de impacto</div>
            </div>
          </div>
        </div>
      </section>

      {/* How Sport Helps Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Cómo el Deporte Transforma Vidas
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              El deporte genera sentido de pertenencia, disciplina, salud mental y reduce la vulnerabilidad.
            </p>
          </div>

          {/* Main Image */}

          {/* Benefits Grid with Images */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative h-48 overflow-hidden bg-muted/30 flex items-center justify-center">
                <img 
                  src={transformacion_1} 
                  alt="Sentido de pertenencia"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-foreground mb-1">Sentido de Pertenencia</h3>
                <p className="text-xs text-muted-foreground">Construyendo comunidad</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative h-48 overflow-hidden bg-muted/30 flex items-center justify-center">
                <img 
                  src={transformacion_2} 
                  alt="Manejo de emociones"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-foreground mb-1">Manejo de Emociones</h3>
                <p className="text-xs text-muted-foreground">Transformando actitudes</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative h-48 overflow-hidden bg-muted/30 flex items-center justify-center">
                <img 
                  src={transformacion_3} 
                  alt="Salud física y mental"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-foreground mb-1">Salud Física y Mental</h3>
                <p className="text-xs text-muted-foreground">Prevención y bienestar</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative h-48 overflow-hidden bg-muted/30 flex items-center justify-center">
                <img 
                  src={transformacion_4} 
                  alt="Disciplina y metas"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-foreground mb-1">Disciplina y Metas</h3>
                <p className="text-xs text-muted-foreground">Trabajo constante</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative h-48 overflow-hidden bg-muted/30 flex items-center justify-center">
                <img 
                  src={transformacion_5} 
                  alt="Trabajo en equipo"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-foreground mb-1">Trabajo en Equipo</h3>
                <p className="text-xs text-muted-foreground">Éxito colectivo</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative h-48 overflow-hidden bg-muted/30 flex items-center justify-center">
                <img 
                  src={transformacion_6} 
                  alt="Oportunidades y futuro"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-foreground mb-1">Oportunidades y Futuro</h3>
                <p className="text-xs text-muted-foreground">Abriendo puertas</p>
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
              ¿Qué Hacemos con tu Donación?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Las donaciones son usadas para seguir transformando vidas a través del deporte.
            </p>
          </div>

          {/* Activities Grid with Images */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative h-56 overflow-hidden bg-muted/30 flex items-center justify-center">
                <img 
                  src= {impacto}
                  alt="Equipo deportivo"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-foreground mb-1">Equipo Deportivo</h3>
                <p className="text-xs text-muted-foreground">Para entrenamiento y práctica deportiva</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative h-56 overflow-hidden bg-muted/30 flex items-center justify-center">
                <img 
                  src={heroImage}
                  alt="Torneos"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-foreground mb-1">Torneos</h3>
                <p className="text-xs text-muted-foreground">Participación en competencias deportivas</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative h-56 overflow-hidden bg-muted/30 flex items-center justify-center">
                <img 
                  src={prueba}
                  alt="Proyectos definidos"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-foreground mb-1">Proyectos Definidos</h3>
                <p className="text-xs text-muted-foreground">Donaciones dedicadas a proyectos específicos</p>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Message with Image */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="relative h-64 rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center">
                <img
                  src= {impacto}
                  alt="Comunidad unida"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-lg text-foreground leading-relaxed mb-3">
                  <span className="font-bold text-primary">Cada donación es un paso</span> hacia una comunidad más unida, sana y con futuro.
                </p>
                <p className="text-sm text-muted-foreground">
                  Trabajamos con transparencia total. Puedes elegir si tu donación va a un proyecto específico o a inversión libre.
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
