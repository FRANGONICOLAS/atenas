import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BoldPaymentButton } from './BoldPaymentButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-react';

interface BoldDonationFormProps {
  projectId?: string;
  projectName?: string;
  suggestedAmounts?: number[];
  onSuccess?: (orderId: string) => void;
}

export function BoldDonationForm({
  projectId,
  projectName,
  suggestedAmounts = [10000, 25000, 50000, 100000],
  onSuccess
}: BoldDonationFormProps) {
  const [amount, setAmount] = useState<number>(suggestedAmounts[0]);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string>('');

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseInt(value.replace(/\D/g, ''));
    if (!isNaN(numValue) && numValue > 0) {
      setAmount(numValue);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleSuccess = (orderId: string) => {
    setShowSuccess(true);
    setSuccessOrderId(orderId);
    onSuccess?.(orderId);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Realizar Donación</CardTitle>
        <CardDescription>
          {projectName 
            ? `Apoya el proyecto: ${projectName}` 
            : 'Realiza tu donación de forma segura con Bold'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {showSuccess ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ¡Transacción iniciada exitosamente! <br />
              ID de orden: <span className="font-mono">{successOrderId}</span>
              <br />
              <span className="text-sm">
                Recibirás la confirmación una vez se complete el pago.
              </span>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Montos sugeridos */}
            <div className="space-y-2">
              <Label>Selecciona un monto</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {suggestedAmounts.map((suggestedAmount) => (
                  <button
                    key={suggestedAmount}
                    type="button"
                    onClick={() => handleAmountSelect(suggestedAmount)}
                    className={`
                      px-4 py-3 rounded-lg border-2 transition-all
                      ${amount === suggestedAmount && !customAmount
                        ? 'border-primary bg-primary/10 font-semibold'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    {formatCurrency(suggestedAmount)}
                  </button>
                ))}
              </div>
            </div>

            {/* Monto personalizado */}
            <div className="space-y-2">
              <Label htmlFor="customAmount">O ingresa un monto personalizado</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  id="customAmount"
                  type="text"
                  placeholder="50.000"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Descripción opcional */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Mensaje o dedicatoria (opcional)
              </Label>
              <Textarea
                id="description"
                placeholder="Escribe un mensaje para acompañar tu donación..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Resumen */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total a donar:</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(amount)}
                </span>
              </div>
              {projectName && (
                <div className="text-sm text-gray-600">
                  Proyecto: <span className="font-medium">{projectName}</span>
                </div>
              )}
            </div>

            {/* Botón de pago */}
            <BoldPaymentButton
              amount={amount}
              currency="COP"
              description={description || `Donación ${projectName ? `para ${projectName}` : ''}`}
              projectId={projectId}
              onSuccess={handleSuccess}
              className="w-full"
              size="lg"
            />

            {/* Información de seguridad */}
            <p className="text-xs text-center text-gray-500">
              🔒 Pago seguro procesado por Bold. Tus datos están protegidos.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
