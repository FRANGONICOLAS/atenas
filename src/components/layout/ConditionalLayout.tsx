import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

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

  const isAuthRoute = authRoutes.includes(location.pathname);

  if (isAuthRoute) {
    // Solo mostrar el contenido sin layout
    return <>{children}</>;
  }

  // Mostrar con Navbar y Footer
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
