import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
import { useBoldCheckout } from '@/hooks/useBoldCheckout';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BoldPaymentButtonProps {
  amount: number;
  currency?: string;
  description?: string;
  projectId?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
  onSuccess?: (orderId: string) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
}

export function BoldPaymentButton({
  amount,
  currency = 'COP',
  description,
  projectId,
  className,
  variant = 'default',
  size = 'default',
  children,
  onSuccess,
  onError,
  disabled = false
}: BoldPaymentButtonProps) {
  const [showError, setShowError] = useState(false);

  const { openCheckout, isLoading, error } = useBoldCheckout({
    amount,
    currency,
    description,
    projectId,
    onSuccess: (orderId) => {
      setShowError(false);
      onSuccess?.(orderId);
    },
    onError: (err) => {
      setShowError(true);
      onError?.(err);
    }
  });

  const handleClick = async () => {
    setShowError(false);
    await openCheckout();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleClick}
        disabled={disabled || isLoading || amount <= 0}
        variant={variant}
        size={size}
        className={className}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            {children || `Pagar ${formatCurrency(amount)}`}
          </>
        )}
      </Button>

      {showError && error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
