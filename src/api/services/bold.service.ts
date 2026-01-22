import { client } from '../supabase/client';
import type {
  BoldTransaction,
  BoldSignatureRequest,
  BoldSignatureResponse,
  BoldCheckoutConfig
} from '@/types/bold.types';

export const boldService = {
  /**
   * Obtener configuración de Bold desde variables de entorno
   */
  getBoldConfig(): { apiKey: string; isProduction: boolean; redirectionUrl: string } {
    // En producción, usar variables de entorno
    const apiKey = import.meta.env.VITE_BOLD_API_KEY || '';
    const isProduction = import.meta.env.VITE_BOLD_PRODUCTION === 'true';
    const redirectionUrl = import.meta.env.VITE_BOLD_REDIRECT_URL || `${window.location.origin}/payment/result`;

    if (!apiKey) {
      console.warn('⚠️ VITE_BOLD_API_KEY not configured');
    }

    return { apiKey, isProduction, redirectionUrl };
  },

  /**
   * Solicitar firma de integridad a Supabase Edge Function
   */
  async requestIntegritySignature(
    request: BoldSignatureRequest
  ): Promise<BoldSignatureResponse> {
    // Obtener URL de la Edge Function
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/bold-signature`;
    
    console.log('🌐 Calling Edge Function:', edgeFunctionUrl);
    console.log('📤 Request payload:', request);
    
    try {
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(request)
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Edge Function error:', errorData);
        throw new Error(errorData.error || `Edge Function failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Edge Function response:', data);
      return data;
    } catch (error) {
      console.error('❌ Error requesting signature:', error);
      throw error;
    }
  },

  /**
   * Crear registro de transacción Bold en Supabase
   */
  async createBoldTransaction(
    transaction: Omit<BoldTransaction, 'bold_transaction_id' | 'created_at' | 'updated_at'>
  ): Promise<BoldTransaction> {
    const { data, error } = await client
      .from('bold_transactions')
      .insert([transaction])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Actualizar estado de transacción Bold
   */
  async updateBoldTransaction(
    orderId: string,
    updates: Partial<BoldTransaction>
  ): Promise<BoldTransaction> {
    const { data, error } = await client
      .from('bold_transactions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Obtener transacción Bold por order_id
   */
  async getBoldTransactionByOrderId(orderId: string): Promise<BoldTransaction | null> {
    const { data, error } = await client
      .from('bold_transactions')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No encontrado
      throw error;
    }

    return data;
  },

  /**
   * Obtener transacciones Bold de un usuario
   */
  async getUserBoldTransactions(userId: string): Promise<BoldTransaction[]> {
    const { data, error } = await client
      .from('bold_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};
