import { Quote, Star, ChevronLeft, ChevronRight, Plus, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CTA from '@/components/CTA';
import { usePublicTestimonials } from '@/hooks/usePublicData';
import { useAuth } from '@/hooks/useAuth';
import { CreateTestimonialModal } from '@/pages/Public/components/CreateTestimonialModal';

interface DBTestimonial {
  testimonial_id: string;
  first_name: string | null;
  last_name: string | null;
  profile_images_id: string | null;
  content: string;
  rating: number;
  approve: boolean;
}

const TestimonialsPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Usar hook público con cache compartida entre rutas
  const { testimonials: dbTestimonials, loading, handleCreate } = usePublicTestimonials();

  // Handler para abrir modal (verificar autenticación)
  const handleOpenCreateModal = () => {
    if (!user) {
      // Si no está loggeado, redirigir a registro
      navigate('/registro');
      return;
    }
    setIsCreateModalOpen(true);
  };

  // Mapear testimonios de BD a formato del componente
  const testimonials = useMemo(() => {
    return (dbTestimonials as unknown as DBTestimonial[]).map((dbT) => {
      const userName = dbT.first_name || dbT.last_name
        ? `${dbT.first_name || ''} ${dbT.last_name || ''}`.trim() 
        : t.testimonials.defaultUser;
      const userImage = dbT.profile_images_id || null;
      
      return {
        id: parseInt(dbT.testimonial_id.substring(0, 8), 16),
        name: userName,
        role: t.testimonials.memberRole,
        image: userImage,
        quote: dbT.content,
        rating: dbT.rating,
        featured: dbT.approve === true,
      };
    });
  }, [dbTestimonials, t]);

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
            {user ? t.testimonials.create : t.testimonials.registerToCreate}
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
            <p className="text-primary-foreground/70">{t.testimonials.noTestimonials}</p>
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
            {t.testimonials.successStories.title}
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
                  <Badge className="mb-3 bg-secondary">{t.testimonials.successStories.badge}</Badge>
                  <h3 className="font-bold text-xl text-foreground mb-2">Andrés Rodríguez</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t.testimonials.successStories.items.andres.title}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {t.testimonials.successStories.items.andres.description}
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
                  <Badge className="mb-3 bg-secondary">{t.testimonials.successStories.badge}</Badge>
                  <h3 className="font-bold text-xl text-foreground mb-2">Laura Jiménez</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t.testimonials.successStories.items.laura.title}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {t.testimonials.successStories.items.laura.description}
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
            {t.testimonials.moreTestimonials}
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
