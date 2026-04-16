import { useState, useCallback, useRef } from 'react';
import { initBoldCheckout, generateOrderId, formatBoldAmount } from '@/lib/boldCheckout';
import { boldService } from '@/api/services/bold.service';
import type { 
  BoldCheckoutConfig, 
  BoldCheckoutInstance
} from '@/types/bold.types';
import { useAuth } from './useAuth';

interface UseBoldCheckoutOptions {
  amount: number;
  currency?: string;
  description?: string;
  projectId?: string;
  onSuccess?: (orderId: string) => void;
  onError?: (error: Error) => void;
}

export function useBoldCheckout(options: UseBoldCheckoutOptions) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const checkoutInstanceRef = useRef<BoldCheckoutInstance | null>(null);

  /**
   * Inicializar y abrir checkout de Bold
   */
  const openCheckout = useCallback(async () => {
    if (!user) {
      setError('Debes iniciar sesión para realizar un pago');
      return;
    }

    if (options.amount <= 0) {
      setError('El monto debe ser mayor a cero');
      return;
    }

    // Timeout de seguridad para evitar loading infinito
    const timeoutId = setTimeout(() => {
      console.warn('⏱️ Checkout timeout reached');
      setIsLoading(false);
      setError('El proceso tardó demasiado. Por favor, intenta de nuevo.');
    }, 15000); // 15 segundos

    try {
      setIsLoading(true);
      setError(null);

      // Asegura que el SDK de Bold exista antes de iniciar el flujo.
      // Si el script es bloqueado por extensiones/políticas, fallamos temprano.
      await initBoldCheckout();

      // Generar order ID único
      const newOrderId = generateOrderId('ATENAS');
      setOrderId(newOrderId);

      // Preparar request para firma de integridad
      const signatureRequest = {
        orderId: newOrderId,
        currency: options.currency || 'COP',
        amount: formatBoldAmount(options.amount),
        description: options.description
      };

      // Obtener firma de integridad del backend
      const { integritySignature } = await boldService.requestIntegritySignature(
        signatureRequest
      );

      // Obtener configuración de Bold
      const config = boldService.getBoldConfig();

      // Crear registro en Supabase
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validProjectId = options.projectId && uuidRegex.test(options.projectId)
        ? options.projectId
        : null;

      await boldService.createBoldTransaction({
        order_id: newOrderId,
        user_id: user.id,
        project_id: validProjectId,
        amount: options.amount, // Ya es number, no necesita formateo
        currency: options.currency || 'COP',
        status: 'PENDING',
        description: options.description,
        integrity_signature: integritySignature
      });

      // Configurar checkout de Bold con Embedded Checkout
      const checkoutConfig: BoldCheckoutConfig = {
        orderId: newOrderId,
        currency: options.currency || 'COP',
        amount: formatBoldAmount(options.amount),
        apiKey: config.apiKey,
        integritySignature,
        description: options.description,
        redirectionUrl: config.redirectionUrl,
        renderMode: 'embedded' // Modal sin salir de la página
      };

      // Crear instancia de checkout
      if (!window.BoldCheckout) {
        throw new Error('BoldCheckout no está disponible. Verifica bloqueadores de scripts/extensiones e intenta nuevamente.');
      }

      const checkout = new window.BoldCheckout(checkoutConfig);
      checkoutInstanceRef.current = checkout;

      // Abrir checkout
      checkout.open();

      // Limpiar timeout
      clearTimeout(timeoutId);

      // Callback de éxito
      options.onSuccess?.(newOrderId);

    } catch (err) {
      // Limpiar timeout
      clearTimeout(timeoutId);
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Error al abrir el checkout de Bold';
      
      setError(errorMessage);
      
      // Mostrar detalles del error
      if (err instanceof Error) {
        console.error('Error details:', {
          message: err.message,
          stack: err.stack
        });
      }
      
      options.onError?.(err as Error);
    } finally {
      console.log('🏁 Checkout process finished, setting isLoading to false');
      setIsLoading(false);
    }
  }, [user, options]);

  /**
   * Actualizar configuración del checkout existente
   */
  const updateAmount = useCallback((newAmount: number) => {
    if (checkoutInstanceRef.current) {
      checkoutInstanceRef.current.updateConfig('amount', formatBoldAmount(newAmount));
    }
  }, []);

  /**
   * Verificar estado de transacción
   */
  const checkTransactionStatus = useCallback(async (orderIdToCheck: string) => {
    try {
      const transaction = await boldService.getBoldTransactionByOrderId(orderIdToCheck);
      return transaction;
    } catch (err) {
      console.error('Error checking transaction status:', err);
      return null;
    }
  }, []);

  return {
    openCheckout,
    updateAmount,
    checkTransactionStatus,
    isLoading,
    error,
    orderId,
    checkoutInstance: checkoutInstanceRef.current
  };
}
