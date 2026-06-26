import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, User, LogOut, ChevronDown, Users, Target, MapPin, Trophy, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DesktopNavProps {
  homeLink: string;
  navLinks: { href: string; label: string }[];
  setIsOpen: (v: boolean) => void;
}

export const DesktopNav = ({ homeLink, navLinks }: DesktopNavProps) => {
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
    if (user?.first_name && user?.last_name) return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    return user?.email ? user.email[0].toUpperCase() : 'U';
  };

  const triggerClass = (active: boolean) => cn(
    'text-sm font-medium transition-all hover:text-primary flex items-center gap-1.5 px-1 py-2 rounded-md hover:bg-primary/5 group',
    active ? 'text-primary bg-primary/10' : 'text-muted-foreground'
  );

  const linkClass = (path: string) => cn(
    'w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors',
    isActive(path) ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-primary/5 text-foreground'
  );

  const navLinkClass = (href: string) => cn(
    'text-sm font-medium transition-colors hover:text-primary px-1',
    isActive(href) ? 'text-primary' : 'text-muted-foreground'
  );

  return (
    <div className="hidden lg:flex items-center gap-3">
      <Link to={homeLink} className={navLinkClass(homeLink)}>{t.nav.home}</Link>

      {/* About Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className={triggerClass(isAboutActive)}>
          {t.nav.about}
          <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 mt-2 p-2 bg-card border border-border shadow-lg rounded-lg">
          {[
            { to: '/quienes-somos', icon: Users, label: t.about.title },
            { to: '/que-hacemos', icon: Target, label: t.nav.whatWeDo },
            { to: '/sedes', icon: MapPin, label: t.nav.locations },
          ].map(({ to, icon: Icon, label }) => (
            <DropdownMenuItem key={to} asChild>
              <Link to={to} className={linkClass(to)}>
                <Icon className="w-4 h-4" /> <span>{label}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Beneficiaries Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className={triggerClass(isBeneficiariesActive)}>
          {t.nav.beneficiaries}
          <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 mt-2 p-2 bg-card border border-border shadow-lg rounded-lg">
          {[
            { to: '/categorias', icon: Trophy, label: t.nav.categories },
            { to: '/jugadores', icon: Users, label: t.nav.players },
            { to: '/testimonios', icon: Quote, label: t.nav.testimonials },
          ].map(({ to, icon: Icon, label }) => (
            <DropdownMenuItem key={to} asChild>
              <Link to={to} className={linkClass(to)}>
                <Icon className="w-4 h-4" /> <span>{label}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {navLinks.slice(1).map((link) => (
        <Link key={link.href} to={link.href} className={navLinkClass(link.href)}>{link.label}</Link>
      ))}

      {/* Language Switcher */}
      <LanguageSwitcher variant="ghost" size="sm" className="gap-1" labelType="short" />

      {/* Auth Section */}
      {isAuthenticated ? (
        <div className="flex items-center gap-2">
          <Link to="/donar">
            <Button variant="outline" size="sm" className="gap-1">
              <Heart className="w-4 h-4" /> {t.nav.donate}
            </Button>
          </Link>
          <Button size="sm" onClick={() => {
            const roles = user?.roles || [];
            if (roles.includes('admin')) navigate('/admin');
            else if (roles.includes('director')) navigate('/director');
            else if (roles.includes('director_sede')) navigate('/director-sede');
            else if (roles.includes('donator')) navigate('/donator');
            else navigate('/profile');
          }} className="gap-1">
            <User className="w-4 h-4" /> {t.auth.dashboard}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 mt-2 p-2 bg-card border border-border shadow-lg rounded-lg">
              <DropdownMenuLabel className="px-3 py-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user?.first_name} {user?.last_name}</span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem asChild>
                <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors hover:bg-primary/5 text-foreground">
                  <User className="w-4 h-4" /> <span>{t.auth.profile}</span>
                </button>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem asChild>
                <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors hover:bg-destructive/5 text-destructive font-medium cursor-pointer">
                  <LogOut className="w-4 h-4" /> <span>{t.auth.logout}</span>
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link to="/login"><Button variant="ghost" size="sm">{t.nav.login}</Button></Link>
          <Link to="/donar"><Button size="sm" className="gap-1"><Heart className="w-4 h-4" /> {t.nav.donate}</Button></Link>
        </div>
      )}
    </div>
  );
};
