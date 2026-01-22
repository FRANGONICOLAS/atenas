import { useState, useCallback, useRef } from 'react';
import { initBoldCheckout, generateOrderId, formatBoldAmount } from '@/lib/boldCheckout';
import { boldService } from '@/api/services/bold.service';
import type { 
  BoldCheckoutConfig, 
  BoldCheckoutInstance,
  BoldCheckoutError 
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
      
      console.log('🚀 Starting Bold checkout process...');
      console.log('User:', user.id);
      console.log('Amount:', options.amount);

      // 1. Cargar script de Bold
      console.log('📦 Loading Bold script...');
      await initBoldCheckout();
      console.log('✅ Bold script loaded');

      // 2. Generar order ID único
      const newOrderId = generateOrderId('ATENAS');
      setOrderId(newOrderId);
      console.log('🆔 Order ID generated:', newOrderId);

      // 3. Preparar request para firma de integridad
      const signatureRequest = {
        orderId: newOrderId,
        currency: options.currency || 'COP',
        amount: formatBoldAmount(options.amount),
        description: options.description
      };

      console.log('📝 Requesting signature from Edge Function...', signatureRequest);

      // 4. Obtener firma de integridad del backend
      const { integritySignature } = await boldService.requestIntegritySignature(
        signatureRequest
      );

      console.log('✅ Signature received:', integritySignature);

      // 5. Obtener configuración de Bold
      const config = boldService.getBoldConfig();

      // 6. Crear registro en Supabase
      console.log('📝 Creating Bold transaction in Supabase...');
      await boldService.createBoldTransaction({
        order_id: newOrderId,
        user_id: user.id,
        project_id: options.projectId,
        amount: options.amount, // Ya es number, no necesita formateo
        currency: options.currency || 'COP',
        status: 'PENDING',
        description: options.description,
        integrity_signature: integritySignature
      });
      console.log('✅ Transaction created in Supabase');

      // 7. Configurar checkout de Bold con Embedded Checkout
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

      console.log('🔧 Bold checkout config:', {
        orderId: checkoutConfig.orderId,
        currency: checkoutConfig.currency,
        amount: checkoutConfig.amount,
        apiKey: checkoutConfig.apiKey.substring(0, 15) + '...',
        integritySignature: checkoutConfig.integritySignature.substring(0, 20) + '...',
        redirectionUrl: checkoutConfig.redirectionUrl,
        renderMode: checkoutConfig.renderMode
      });

      // Log para depuración: mostrar qué se usó para generar la firma
      console.log('🔐 Signature was generated from:', {
        orderId: newOrderId,
        amount: formatBoldAmount(options.amount),
        currency: options.currency || 'COP',
        concatenated: `${newOrderId}${formatBoldAmount(options.amount)}${options.currency || 'COP'}`
      });

      // 8. Crear instancia de checkout
      if (!window.BoldCheckout) {
        throw new Error('BoldCheckout no está disponible. El script no se cargó correctamente.');
      }

      console.log('🚀 Creating Bold checkout instance...');
      const checkout = new window.BoldCheckout(checkoutConfig);
      checkoutInstanceRef.current = checkout;

      // 9. Abrir checkout
      console.log('📱 Opening Bold checkout...');
      checkout.open();
      console.log('✅ Bold checkout opened successfully');

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
      console.error('❌ Bold checkout error:', err);
      
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
