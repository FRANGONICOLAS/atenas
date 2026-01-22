import { Quote, Star, ChevronLeft, ChevronRight, Plus, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CTA from '@/components/CTA';
import { useTestimonials } from '@/hooks/useTestimonial';
import { useAuth } from '@/hooks/useAuth';
import { CreateTestimonialModal } from '@/pages/Public/components/CreateTestimonialModal';

const TestimonialsPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Usar el hook para obtener testimonios
  const { testimonials: dbTestimonials, loading, handleCreate } = useTestimonials();

  // Handler para abrir modal (verificar autenticación)
  const handleOpenCreateModal = () => {
    console.log('Botón clickeado, usuario:', user);
    if (!user) {
      // Si no está loggeado, redirigir a registro
      console.log('Navegando a /registro');
      navigate('/registro');
      return;
    }
    setIsCreateModalOpen(true);
  };

  // Mapear testimonios de BD a formato del componente
  const testimonials = useMemo(() => {
    console.log('dbTestimonials:', dbTestimonials); // Debug
    return dbTestimonials.map((t: any) => {
      console.log('Testimonio individual:', t); // Debug
      const userName = t.user 
        ? `${t.user.first_name || ''} ${t.user.last_name || ''}`.trim() 
        : 'Usuario';
      const userImage = t.user?.profile_images_id || null;
      
      return {
        id: parseInt(t.testimonial_id.substring(0, 8), 16),
        name: userName,
        role: "Miembro de la fundación",
        image: userImage,
        quote: t.content,
        rating: t.rating,
        featured: t.approve === true,
      };
    });
  }, [dbTestimonials]);

  const featuredTestimonials = useMemo(() => {
    return testimonials.filter(t => t.featured);
  }, [testimonials]);

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
          <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto mb-6">
            {t.testimonials.subtitle}
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={handleOpenCreateModal}
            className="gap-2"
          >
            <Plus className="w-5 h-5" />
            {user ? 'Crear Testimonio' : 'Registrarse para Crear Testimonio'}
          </Button>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : featuredTestimonials.length === 0 ? (
        <section className="py-16 bg-foreground">
          <div className="container mx-auto px-4 text-center">
            <p className="text-primary-foreground/70">No hay testimonios destacados todavía</p>
          </div>
        </section>
      ) : (
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
                        {testimonial.image ? (
                          <img 
                            src={testimonial.image} 
                            alt={testimonial.name}
                            className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-4 border-primary"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-primary/20 flex items-center justify-center border-4 border-primary">
                            <User className="w-10 h-10 text-primary" />
                          </div>
                        )}
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
      )}

      {/* Modal de crear testimonio */}
      {user && (
        <CreateTestimonialModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSubmit={handleCreate}
          userId={user.id}
          beneficiaryId={user.id} // Usamos el mismo user.id como beneficiary por ahora
        />
      )}

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
                    {testimonial.image ? (
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                    )}
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
      <CTA />
    </div>
  );
};

export default TestimonialsPage;
