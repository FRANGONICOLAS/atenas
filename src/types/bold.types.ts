// Configuración del checkout de Bold
export interface BoldCheckoutConfig {
  orderId: string;
  currency: string;
  amount: string; // Bold espera string
  apiKey: string;
  integritySignature: string;
  description?: string;
  redirectionUrl?: string;
  renderMode?: 'embedded' | 'redirect';
  // Campos opcionales adicionales según documentación Bold
  tax?: string;
  taxBase?: string;
}

// Instancia del checkout Bold
export interface BoldCheckoutInstance {
  open: () => void;
  getConfig: (key: string) => string | undefined;
  updateConfig: (key: string, value: string) => void;
}

// Constructor Bold disponible en window
export interface BoldCheckoutConstructor {
  new (config: BoldCheckoutConfig): BoldCheckoutInstance;
}

// Extender Window para incluir BoldCheckout
declare global {
  interface Window {
    BoldCheckout?: BoldCheckoutConstructor;
  }
}

// Estados de transacción Bold (según webhook)
export type BoldTransactionStatus = 
  | 'APPROVED'
  | 'DECLINED'
  | 'PENDING'
  | 'ERROR';

// Método de pago Bold
export type BoldPaymentMethod = 
  | 'CARD'
  | 'PSE'
  | 'NEQUI'
  | 'DAVIPLATA'
  | 'BANCOLOMBIA_TRANSFER'
  | 'BANCOLOMBIA_QR';

// Payload del webhook de Bold
export interface BoldWebhookPayload {
  id: string;
  orderId: string;
  status: BoldTransactionStatus;
  transactionId: string;
  currency: string;
  amount: number;
  tax?: number;
  taxBase?: number;
  description?: string;
  paymentMethod?: BoldPaymentMethod;
  createdAt: string;
  updatedAt: string;
  // Información del pagador
  payer?: {
    email?: string;
    phone?: string;
    document?: string;
  };
}

// Transacción Bold guardada en Supabase
export interface BoldTransaction {
  bold_transaction_id: string;
  order_id: string;
  user_id: string;
  project_id?: string;
  donation_id?: string;
  amount: number; // Cambiado de string a number para alinear con donation
  currency: string;
  status: string;
  payment_method?: string;
  transaction_id?: string;
  description?: string;
  integrity_signature?: string;
  webhook_payload?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Request para generar firma de integridad (backend)
export interface BoldSignatureRequest {
  orderId: string;
  currency: string;
  amount: string;
  description?: string;
}

// Response de firma de integridad (backend)
export interface BoldSignatureResponse {
  integritySignature: string;
  orderId: string;
}

// Configuración de entorno Bold
export interface BoldConfig {
  apiKey: string;
  isProduction: boolean;
  redirectionUrl: string;
}

// Errores personalizados de Bold
export class BoldCheckoutError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'BoldCheckoutError';
  }
}

export {}; // Asegurar que el archivo sea un módulo
