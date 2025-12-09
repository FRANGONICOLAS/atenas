import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const CTA = () => {
  const { t } = useLanguage();

  return (
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
  );
};

export default CTA;

