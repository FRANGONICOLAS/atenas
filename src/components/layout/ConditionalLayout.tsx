import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { DashboardLayout } from "./DashboardLayout";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export const ConditionalLayout = ({ children }: ConditionalLayoutProps) => {
  const location = useLocation();

  // Rutas que NO deben mostrar Navbar y Footer
  const authRoutes = [
    '/login',
    '/registro',
    '/reset-password',
    '/complete-profile',
    '/auth/callback'
  ];

  // Rutas de dashboard que usan el DashboardLayout (con sidebar)
  const dashboardRoutes = [
    '/admin',
    '/director',
    '/director-sede',
    '/director-proyectos',
    '/director-beneficiarios',
    '/donator',
    '/profile'
  ];

  const isAuthRoute = authRoutes.includes(location.pathname);
  const isDashboardRoute = dashboardRoutes.some(route => location.pathname.startsWith(route));

  if (isAuthRoute) {
    // Solo mostrar el contenido sin layout
    return <>{children}</>;
  }

  if (isDashboardRoute) {
    // Mostrar con DashboardLayout (incluye sidebar, sin navbar/footer)
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  // Mostrar con Navbar y Footer (páginas públicas)
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};
