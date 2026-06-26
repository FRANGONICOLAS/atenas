import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { DesktopNav } from './navbar/DesktopNav';
import { MobileMenu } from './navbar/MobileMenu';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const homeLink = isAuthenticated ? '/inicio' : '/';
  const navLinks = [
    { href: homeLink, label: t.nav.home },
    { href: '/proyectos', label: t.nav.projects },
    { href: '/galeria', label: t.nav.gallery },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to={homeLink} className="flex items-center gap-2">
            <img
              src="/Logo_Atenas.png"
              alt="Logo institucional Fundación Sociodeportiva Atenas"
              className="h-10 w-auto object-contain"
            />
            <span className="font-bold text-lg text-foreground hidden sm:block">
              Fundación Sociodeportiva Atenas
            </span>
          </Link>

          {/* Desktop Navigation */}
          <DesktopNav homeLink={homeLink} navLinks={navLinks} setIsOpen={setIsOpen} />

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        <MobileMenu isOpen={isOpen} setIsOpen={setIsOpen} homeLink={homeLink} navLinks={navLinks} />
      </div>
    </nav>
  );
};

export default Navbar;
