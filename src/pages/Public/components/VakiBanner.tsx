import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export const VakiBanner = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-destructive/10 border-y border-destructive/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="font-semibold text-foreground">{t.vaki.banner.title}</p>
            <p className="text-sm text-muted-foreground">{t.vaki.banner.description}</p>
          </div>
          <Link to="/apoya-comuna-17" className="flex-shrink-0">
            <Button size="sm" className="gap-2">
              {t.vaki.banner.button}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
