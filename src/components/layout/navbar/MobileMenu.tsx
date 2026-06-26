import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, User, LogOut, Users, Target, MapPin, Trophy, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  homeLink: string;
  navLinks: { href: string; label: string }[];
}

export const MobileMenu = ({ isOpen, setIsOpen, homeLink, navLinks }: MobileMenuProps) => {
  const { user, isAuthenticated, signOut } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;
  const isAboutActive = ['/quienes-somos', '/que-hacemos', '/sedes'].includes(location.pathname);
  const isBeneficiariesActive = ['/categorias', '/jugadores', '/testimonios'].includes(location.pathname);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success(t.auth.logoutSuccess);
      navigate('/');
    } catch {
      toast.error(t.auth.logoutError);
    }
  };

  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user?.email) return user.email[0].toUpperCase();
    return 'U';
  };

  const navigateToDashboard = () => {
    const userRoles = user?.roles || [];
    if (userRoles.includes('admin')) navigate('/admin');
    else if (userRoles.includes('director')) navigate('/director');
    else if (userRoles.includes('director_sede')) navigate('/director-sede');
    else if (userRoles.includes('donator')) navigate('/donator');
    else navigate('/profile');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="lg:hidden py-4 border-t border-border">
      <div className="flex flex-col gap-2">
        <Link
          to={homeLink}
          onClick={() => setIsOpen(false)}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            isActive(homeLink) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          )}
        >
          {t.nav.home}
        </Link>

        {/* About Section */}
        <div className="px-4 py-2">
          <div className={cn('text-sm font-medium mb-2', isAboutActive ? 'text-primary' : 'text-foreground')}>
            {t.nav.about}
          </div>
          <div className="flex flex-col gap-1 ml-4">
            {[
              { to: '/quienes-somos', icon: Users, label: t.nav.about },
              { to: '/que-hacemos', icon: Target, label: t.nav.whatWeDo },
              { to: '/sedes', icon: MapPin, label: t.nav.locations },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'px-4 py-2 rounded-md text-sm transition-colors',
                  isActive(to) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'
                )}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Beneficiaries Section */}
        <div className="px-4 py-2">
          <div className={cn('text-sm font-medium mb-2', isBeneficiariesActive ? 'text-primary' : 'text-foreground')}>
            {t.nav.beneficiaries}
          </div>
          <div className="flex flex-col gap-1 ml-4">
            {[
              { to: '/categorias', label: t.nav.categories },
              { to: '/jugadores', label: t.nav.players },
              { to: '/testimonios', label: t.nav.testimonials },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'px-4 py-2 rounded-md text-sm transition-colors',
                  isActive(to) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'
                )}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {navLinks.slice(1).map((link) => (
          <Link
            key={link.href}
            to={link.href}
            onClick={() => setIsOpen(false)}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              isActive(link.href) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            )}
          >
            {link.label}
          </Link>
        ))}

        {/* Mobile Auth Section */}
        {isAuthenticated ? (
          <div className="mt-4 px-4 space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-md bg-muted">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.first_name} {user?.last_name}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </div>
            <Button className="w-full" onClick={navigateToDashboard}>
              <User className="w-4 h-4 mr-2" />
              Ir a Dashboard
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setIsOpen(false); navigate('/profile'); }}>
                <User className="w-4 h-4 mr-2" /> Perfil
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => { setIsOpen(false); handleSignOut(); }}>
                <LogOut className="w-4 h-4 mr-2" /> Salir
              </Button>
            </div>
            <Link to="/donar" className="block" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full gap-1">
                <Heart className="w-4 h-4" /> {t.nav.donate}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex gap-2 mt-4 px-4">
            <Link to="/login" className="flex-1" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full">{t.nav.login}</Button>
            </Link>
            <Link to="/donar" className="flex-1" onClick={() => setIsOpen(false)}>
              <Button className="w-full gap-1"><Heart className="w-4 h-4" /> {t.nav.donate}</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
