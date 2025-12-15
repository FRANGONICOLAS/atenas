import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Botón de regresar */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="gap-2"
        >
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </Button>
      </div>

      {/* Contenido de la página */}
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        {children}
      </div>
    </div>
  );
};
