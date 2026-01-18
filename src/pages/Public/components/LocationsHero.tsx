import { useLanguage } from '@/contexts/LanguageContext';

export const LocationsHero = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-primary">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
          {t.locations.title}
        </h1>
        <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
          {t.locations.subtitle}
        </p>
      </div>
    </section>
  );
};
