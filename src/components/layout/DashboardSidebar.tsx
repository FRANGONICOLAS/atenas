import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronLeft,
  LayoutDashboard,
  Users,
  MapPin,
  Target,
  UserCheck,
  Settings,
  Heart,
  Image as ImageIcon,
  FileText,
  DollarSign,
  Trophy,
  ClipboardList,
  Menu,
  X,
  Home,
  LogOut,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
  roles: string[];
}

const navSections: NavSection[] = [
  {
    title: 'Administración',
    roles: ['admin'],
    items: [
      {
        title: 'Inicio',
        href: '/admin',
        icon: LayoutDashboard,
        description: 'Panel de administración'
      },
      {
        title: 'Usuarios',
        href: '/admin?tab=users',
        icon: Users,
        description: 'Gestión de usuarios'
      },
      {
        title: 'Contenido',
        href: '/admin?tab=content',
        icon: ImageIcon,
        description: 'Gestión de contenido'
      },
      {
        title: 'Imágenes Públicas',
        href: '/admin?tab=site-content',
        icon: ImageIcon,
        description: 'Imágenes de páginas públicas'
      }
    ]
  },
  {
    title: 'Dirección General',
    roles: ['director', 'admin'],
    items: [
      {
        title: 'Inicio',
        href: '/director',
        icon: LayoutDashboard,
        description: 'Panel de dirección general'
      },
      {
        title: 'Proyectos',
        href: '/director?tab=projects',
        icon: Target,
        description: 'Gestión de proyectos'
      },
      {
        title: 'Beneficiarios',
        href: '/director?tab=beneficiaries',
        icon: UserCheck,
        description: 'Gestión de beneficiarios'
      },
      {
        title: 'Sedes',
        href: '/director?tab=headquarters',
        icon: Building,
        description: 'Gestión de sedes con mapa'
      },
      {
        title: 'Reportes',
        href: '/director?tab=reports',
        icon: FileText,
        description: 'Reportes y estadísticas'
      }
    ]
  },
  {
    title: 'Dirección de Sede',
    roles: ['director_sede', 'director', 'admin'],
    items: [
      {
        title: 'Mi Sede',
        href: '/director-sede',
        icon: MapPin,
        description: 'Gestión de mi sede'
      },
      {
        title: 'Beneficiarios',
        href: '/director-sede?tab=beneficiaries',
        icon: Users,
        description: 'Beneficiarios de la sede'
      },
      {
        title: 'Proyectos',
        href: '/director-sede?tab=projects',
        icon: Target,
        description: 'Proyectos de la sede'
      },
      {
        title: 'Evaluaciones',
        href: '/director-sede?tab=evaluations',
        icon: ClipboardList,
        description: 'Evaluaciones y seguimiento'
      },
      {
        title: 'Reportes',
        href: '/director-sede?tab=reports',
        icon: FileText,
        description: 'Reportes de la sede'
      }
    ]
  },
  {
    title: 'Donaciones',
    roles: ['donator', 'admin'],
    items: [
      {
        title: 'Inicio',
        href: '/donator',
        icon: LayoutDashboard,
        description: 'Panel de donante'
      },
      {
        title: 'Mis Donaciones',
        href: '/donator?tab=donations',
        icon: DollarSign,
        description: 'Historial de donaciones'
      },
      {
        title: 'Proyectos',
        href: '/donator?tab=projects',
        icon: Trophy,
        description: 'Proyectos para apoyar'
      }
    ]
  }
];

export const DashboardSidebar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollElement) {
      scrollElement.scrollTop = scrollPositionRef.current;
    }
  });

  const handleLinkClick = () => {
    const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollElement) {
      scrollPositionRef.current = scrollElement.scrollTop;
    }
    setIsMobileOpen(false);
  };

  const userRoles = (user?.roles || [user?.role]).filter(Boolean).map(r => r?.toLowerCase());

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Sesión cerrada exitosamente');
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const toggleSection = (title: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const isActive = (href: string) => {
    const currentPath = location.pathname;
    const currentSearch = location.search;
    const fullPath = currentPath + currentSearch;
    
    if (fullPath === href) return true;
    
    const hrefPath = href.split('?')[0];
    if (hrefPath === currentPath && !href.includes('?') && !currentSearch) return true;
    
    return false;
  };

  const hasAccessToSection = (section: NavSection) => {
    return section.roles.some(role => userRoles.includes(role));
  };

  const visibleSections = navSections.filter(hasAccessToSection);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary-foreground" />
            </div>
            {isOpen && (
              <div>
                <h2 className="font-semibold text-sm">Atenas</h2>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={() => setIsOpen(!isOpen)}
          >
            <ChevronLeft className={cn(
              "w-4 h-4 transition-transform",
              !isOpen && "rotate-180"
            )} />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {visibleSections.map((section) => (
            <div key={section.title} className="mb-4">
              <button
                onClick={() => toggleSection(section.title)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent transition-colors",
                  !isOpen && "justify-center"
                )}
              >
                {isOpen && (
                  <>
                    <span className="text-muted-foreground">{section.title}</span>
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform text-muted-foreground",
                      collapsedSections[section.title] && "-rotate-90"
                    )} />
                  </>
                )}
                {!isOpen && (
                  <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                )}
              </button>

              {(!collapsedSections[section.title] || !isOpen) && (
                <div className={cn("mt-1 space-y-1", !isOpen && "mt-2")}>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group relative",
                          active 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-accent text-muted-foreground hover:text-foreground",
                          !isOpen && "justify-center"
                        )}
                        title={!isOpen ? item.title : undefined}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        {isOpen && (
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            {item.description && (
                              <p className="text-xs opacity-70 truncate">{item.description}</p>
                            )}
                          </div>
                        )}
                        
                        {/* Tooltip for collapsed state */}
                        {!isOpen && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                            {item.title}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <Link
          to="/inicio"
          onClick={handleLinkClick}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors',
            !isOpen && 'justify-center'
          )}
          title={!isOpen ? 'Ir al Inicio' : undefined}
        >
          <Home className="w-4 h-4 shrink-0" />
          {isOpen && <span className="text-sm font-medium">Ir al Inicio</span>}
        </Link>
        
        <Link
          to="/profile"
          onClick={handleLinkClick}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors',
            !isOpen && 'justify-center'
          )}
          title={!isOpen ? 'Mi Perfil' : undefined}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {isOpen && <span className="text-sm font-medium">Mi Perfil</span>}
        </Link>

        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 hover:bg-destructive/10 hover:text-destructive',
            !isOpen && 'justify-center'
          )}
          title={!isOpen ? 'Cerrar Sesión' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {isOpen && <span className="text-sm font-medium">Cerrar Sesión</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </Button>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-transform lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          "w-64"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-card border-r border-border transition-all duration-300 h-screen sticky top-0",
          isOpen ? "w-64" : "w-16"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
};
