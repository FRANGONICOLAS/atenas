import { BoldCheckoutError } from '@/types/bold.types';

const BOLD_SCRIPT_URL = 'https://checkout.bold.co/library/boldPaymentButton.js';

// Inicializa el script de Bold Checkout
// @returns Promise que se resuelve cuando el script carga correctamente
export function initBoldCheckout(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Verificar si el script ya está cargado
    const existingScript = document.querySelector(
      `script[src="${BOLD_SCRIPT_URL}"]`
    );

    if (existingScript) {
      // Si ya existe, verificar si BoldCheckout está disponible
      if (window.BoldCheckout) {
        resolve();
      } else {
        // Esperar a que el script existente termine de cargar
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () => 
          reject(new BoldCheckoutError('Bold script failed to load'))
        );
      }
      return;
    }

    // Crear y agregar el script
    const script = document.createElement('script');
    script.src = BOLD_SCRIPT_URL;
    script.async = true;

    script.onload = () => {
      if (window.BoldCheckout) {
        console.info('✅ Bold Checkout script loaded successfully');
        resolve();
      } else {
        reject(new BoldCheckoutError('BoldCheckout constructor not available'));
      }
    };

    script.onerror = () => {
      reject(new BoldCheckoutError('Failed to load Bold Checkout script'));
    };

    document.head.appendChild(script);
  });
}

// Verifica si el script de Bold está cargado
export function isBoldCheckoutLoaded(): boolean {
  return !!window.BoldCheckout;
}

// Genera un ID único para la orden
// @param prefix Prefijo para el ID (por defecto 'ORDER')
export function generateOrderId(prefix: string = 'ORDER'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `${prefix}-${timestamp}-${random}`;
}

// Formatea un monto para Bold (debe ser string)
// @param amount Monto numérico
// @returns String del monto
export function formatBoldAmount(amount: number): string {
  return Math.round(amount).toString();
}
