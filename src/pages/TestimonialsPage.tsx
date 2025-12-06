import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';

const TestimonialsPage = () => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'Carlos Martínez',
      role: 'Padre de familia',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop',
      quote: 'Mi hijo llegó a la fundación tímido y sin confianza. Hoy es capitán de su equipo y ha mejorado notablemente en el colegio. El deporte le cambió la vida.',
      rating: 5,
      featured: true,
    },
    {
      id: 2,
      name: 'María Elena López',
      role: 'Madre de jugadora',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop',
      quote: 'La fundación no solo entrena futbolistas, forma personas. Mi hija ha aprendido valores como el trabajo en equipo, la disciplina y el respeto.',
      rating: 5,
      featured: true,
    },
    {
      id: 3,
      name: 'Andrés Rodríguez',
      role: 'Exjugador - Ahora profesional',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
      quote: 'Llegué a la fundación con 10 años sin saber que el fútbol me abriría tantas puertas. Gracias a ellos hoy juego en las divisiones inferiores de un club profesional.',
      rating: 5,
      featured: true,
    },
    {
      id: 4,
      name: 'Sandra Jiménez',
      role: 'Donadora recurrente',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop',
      quote: 'Ver el impacto de las donaciones en la vida de estos jóvenes es increíble. La transparencia de la fundación me da total confianza.',
      rating: 5,
    },
    {
      id: 5,
      name: 'Roberto Silva',
      role: 'Entrenador voluntario',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
      quote: 'Ser parte de la transformación de estos jóvenes es el mayor regalo. La fundación tiene un modelo de formación integral que realmente funciona.',
      rating: 5,
    },
    {
      id: 6,
      name: 'Valentina Torres',
      role: 'Jugadora categoría Formación',
      image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=300&h=300&fit=crop',
      quote: 'Aquí encontré una familia. Los entrenadores nos ayudan no solo en el fútbol sino también con las tareas y los problemas personales.',
      rating: 5,
    },
  ];

  const featuredTestimonials = testimonials.filter(t => t.featured);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredTestimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredTestimonials.length) % featuredTestimonials.length);
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            {t.testimonials.title}
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
            {t.testimonials.subtitle}
          </p>
        </div>
      </section>

      {/* Featured Testimonial Carousel */}
      <section className="py-16 bg-foreground">
        <div className="container mx-auto px-4">
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {featuredTestimonials.map((testimonial) => (
                  <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                    <div className="text-center">
                      <Quote className="w-12 h-12 mx-auto mb-6 text-primary opacity-50" />
                      <p className="text-xl md:text-2xl text-primary-foreground italic mb-8 leading-relaxed">
                        "{testimonial.quote}"
                      </p>
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-4 border-primary"
                      />
                      <h3 className="font-bold text-primary-foreground text-lg">{testimonial.name}</h3>
                      <p className="text-primary-foreground/70">{testimonial.role}</p>
                      <div className="flex justify-center gap-1 mt-2">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-secondary text-secondary" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={prevSlide}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={nextSlide}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {featuredTestimonials.map((_, i) => (
                <button
                  key={i}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    i === currentIndex ? 'bg-primary' : 'bg-primary-foreground/30'
                  }`}
                  onClick={() => setCurrentIndex(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Casos de Éxito
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
                  alt="Andrés"
                  className="w-full h-48 md:h-full object-cover"
                />
                <CardContent className="p-6">
                  <Badge className="mb-3 bg-secondary">Caso Emblemático</Badge>
                  <h3 className="font-bold text-xl text-foreground mb-2">Andrés Rodríguez</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    De un barrio vulnerable a las divisiones inferiores de un club profesional
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Andrés llegó a la fundación con 10 años. Sin recursos económicos, encontró en el fútbol una salida. 
                    Hoy, a sus 17 años, está firmado con un club profesional y es embajador de nuestra fundación.
                  </p>
                </CardContent>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <img 
                  src="https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop"
                  alt="Laura"
                  className="w-full h-48 md:h-full object-cover"
                />
                <CardContent className="p-6">
                  <Badge className="mb-3 bg-secondary">Caso Emblemático</Badge>
                  <h3 className="font-bold text-xl text-foreground mb-2">Laura Jiménez</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Máxima goleadora y seleccionada nacional sub-15
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Laura demostró que con talento y dedicación no hay límites. 
                    Fue convocada a la selección nacional y hoy inspira a decenas de niñas en la fundación.
                  </p>
                </CardContent>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* All Testimonials Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Más Testimonios
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="h-full">
                <CardContent className="p-6">
                  <Quote className="w-8 h-8 text-primary/30 mb-4" />
                  <p className="text-muted-foreground mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TestimonialsPage;
