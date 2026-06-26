import { Link } from 'react-router-dom';
import { Heart, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeroSectionProps {
  heroImageUrl: string | null;
}

export const HeroSection = ({ heroImageUrl }: HeroSectionProps) => {
  const { t } = useLanguage();

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        {heroImageUrl ? (
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImageUrl})` }} />
        ) : (
          <div className="absolute inset-0 bg-muted/30" />
        )}
        {!heroImageUrl && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center p-4">
              <AlertTriangle className="w-14 h-14 mx-auto mb-2 text-muted-foreground/60" />
              <p className="text-base text-muted-foreground italic">Imagen de portada</p>
            </div>
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
                <Heart className="w-5 h-5" /> {t.home.donateNow}
              </Button>
            </Link>
            <Link to="/quienes-somos">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 text-base bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground">
                {t.home.learnMore} <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
