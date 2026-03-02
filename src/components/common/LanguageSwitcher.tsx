import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe, Languages } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
  labelType?: 'full' | 'short';
}

export const LanguageSwitcher = ({
  variant = 'ghost',
  size = 'sm',
  className,
  showLabel = true,
  labelType = 'full',
}: LanguageSwitcherProps) => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleLanguage}
      className={className}
    >
      <Globe className="h-4 w-4 mr-2" />
      {showLabel && (
        <span className={labelType === 'short' ? 'hidden sm:inline' : ''}>
          {labelType === 'short' 
            ? language.toUpperCase() 
            : (language === 'es' ? 'Español' : 'English')}
        </span>
      )}
    </Button>
  );
};
