import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Clock, ArrowLeft, Home } from 'lucide-react';

const DonationResultPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'approved' | 'declined' | 'pending' | null>(null);
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
    // Obtener parámetros de la URL
    const txStatus = searchParams.get('bold-tx-status');
    const txOrderId = searchParams.get('bold-order-id');

    if (txStatus) {
      setStatus(txStatus as 'approved' | 'declined' | 'pending');
    }
    if (txOrderId) {
      setOrderId(txOrderId);
    }
  }, [searchParams]);

  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          icon: <Check className="w-16 h-16 text-green-600" />,
          bgColor: 'bg-green-100',
          title: '¡Pago Exitoso!',
          message: 'Tu donación ha sido procesada correctamente. ¡Gracias por tu generosidad!',
          buttonText: 'Ver mis donaciones',
          buttonLink: '/donator',
        };
      case 'declined':
        return {
          icon: <X className="w-16 h-16 text-red-600" />,
          bgColor: 'bg-red-100',
          title: 'Pago Rechazado',
          message: 'Tu pago no pudo ser procesado. Por favor, intenta nuevamente o usa otro método de pago.',
          buttonText: 'Intentar de nuevo',
          buttonLink: '/donation',
        };
      case 'pending':
        return {
          icon: <Clock className="w-16 h-16 text-yellow-600" />,
          bgColor: 'bg-yellow-100',
          title: 'Pago Pendiente',
          message: 'Tu pago está siendo procesado. Recibirás una confirmación por correo cuando se complete.',
          buttonText: 'Ver mis donaciones',
          buttonLink: '/donator',
        };
      default:
        return {
          icon: <Clock className="w-16 h-16 text-gray-600" />,
          bgColor: 'bg-gray-100',
          title: 'Procesando...',
          message: 'Estamos verificando el estado de tu pago.',
          buttonText: 'Volver al inicio',
          buttonLink: '/',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="min-h-screen pt-20 bg-background flex items-center justify-center">
      <Card className="max-w-md w-full mx-4">
        <CardContent className="pt-8 text-center">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full ${config.bgColor} flex items-center justify-center`}>
            {config.icon}
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {config.title}
          </h2>
          
          <p className="text-muted-foreground mb-4">
            {config.message}
          </p>

          {orderId && (
            <div className="bg-muted/50 p-4 rounded-lg mb-6">
              <p className="text-sm text-muted-foreground mb-1">ID de Orden:</p>
              <p className="font-mono text-sm font-medium">{orderId}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Link to={config.buttonLink}>
              <Button className="w-full">
                {config.buttonText}
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="w-full gap-2">
                <Home className="w-4 h-4" />
                Volver al inicio
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonationResultPage;
