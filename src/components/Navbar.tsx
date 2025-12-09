import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, Heart, ChevronDown, Users, Target, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const navLinks = [
    { href: '/', label: t.nav.home },
    { href: '/categorias', label: t.nav.categories },
    { href: '/jugadores', label: t.nav.players },
    { href: '/proyectos', label: t.nav.projects },
    { href: '/galeria', label: t.nav.gallery },
    { href: '/testimonios', label: t.nav.testimonials },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isAboutActive = location.pathname === '/quienes-somos' || location.pathname === '/que-hacemos' || location.pathname === '/sedes';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:block">
              Fundación Sociodeportiva Atenas
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              to="/"
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                isActive('/') ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {t.nav.home}
            </Link>
            
            {/* About Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  'text-sm font-medium transition-all hover:text-primary flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-primary/5 group',
                  isAboutActive ? 'text-primary bg-primary/10' : 'text-muted-foreground'
                )}
              >
                {t.nav.about}
                <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                className="w-56 mt-2 p-2 bg-card border border-border shadow-lg rounded-lg"
              >
                <DropdownMenuItem asChild>
                  <Link 
                    to="/quienes-somos" 
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors',
                      isActive('/quienes-somos')
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-primary/5 text-foreground'
                    )}
                  >
                    <Users className="w-4 h-4" />
                    <span>Quiénes Somos</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    to="/que-hacemos" 
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors',
                      isActive('/que-hacemos')
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-primary/5 text-foreground'
                    )}
                  >
                    <Target className="w-4 h-4" />
                    <span>{t.nav.whatWeDo}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    to="/sedes" 
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors',
                      isActive('/sedes')
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-primary/5 text-foreground'
                    )}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>{t.nav.locations}</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {navLinks.slice(1).map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  isActive(link.href) ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="gap-1"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{language.toUpperCase()}</span>
            </Button>

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  {t.nav.login}
                </Button>
              </Link>
              <Link to="/donar">
                <Button size="sm" className="gap-1">
                  <Heart className="w-4 h-4" />
                  {t.nav.donate}
                </Button>
              </Link>
            </div>

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
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive('/')
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                {t.nav.home}
              </Link>
              
              {/* About Section in Mobile */}
              <div className="px-4 py-2">
                <div className={cn(
                  'text-sm font-medium mb-2',
                  isAboutActive ? 'text-primary' : 'text-foreground'
                )}>
                  {t.nav.about}
                </div>
                <div className="flex flex-col gap-1 ml-4">
                  <Link
                    to="/quienes-somos"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'px-4 py-2 rounded-md text-sm transition-colors',
                      isActive('/quienes-somos')
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground'
                    )}
                  >
                    {t.nav.about}
                  </Link>
                  <Link
                    to="/que-hacemos"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'px-4 py-2 rounded-md text-sm transition-colors',
                      isActive('/que-hacemos')
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground'
                    )}
                  >
                    {t.nav.whatWeDo}
                  </Link>
                  <Link
                    to="/sedes"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'px-4 py-2 rounded-md text-sm transition-colors',
                      isActive('/sedes')
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground'
                    )}
                  >
                    {t.nav.locations}
                  </Link>
                </div>
              </div>

              {navLinks.slice(1).map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive(link.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-2 mt-4 px-4">
                <Link to="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">
                    {t.nav.login}
                  </Button>
                </Link>
                <Link to="/donar" className="flex-1" onClick={() => setIsOpen(false)}>
                  <Button className="w-full gap-1">
                    <Heart className="w-4 h-4" />
                    {t.nav.donate}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
