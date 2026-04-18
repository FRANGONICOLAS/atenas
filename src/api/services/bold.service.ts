import { client } from "../supabase/client";
import type {
  BoldTransaction,
  BoldSignatureRequest,
  BoldSignatureResponse,
} from "@/types/bold.types";
import type {
  BoldTransactionsInsert,
  BoldTransactionsUpdate,
} from "@/api/types";

export const boldService = {
  // Obtener configuración de Bold desde variables de entorno
  getBoldConfig(): {
    apiKey: string;
    merchantId?: string;
    isProduction: boolean;
    redirectionUrl: string;
  } {
    // En producción, usar variables de entorno
    const apiKey = import.meta.env.VITE_BOLD_API_KEY || "";
    const merchantId = import.meta.env.VITE_BOLD_MERCHANT_ID || undefined;
    const isProduction = import.meta.env.VITE_BOLD_PRODUCTION === "true";
    const redirectionUrl =
      import.meta.env.VITE_BOLD_REDIRECT_URL ||
      `${window.location.origin}/payment/result`;

    if (!apiKey) {
      console.warn("⚠️ VITE_BOLD_API_KEY not configurado");
    }
    if (!merchantId) {
      console.warn(
        "⚠️ VITE_BOLD_MERCHANT_ID no configurado. Si Bold requiere merchantId explícito, agrega esta variable de entorno.",
      );
    }

    return { apiKey, merchantId, isProduction, redirectionUrl };
  },

  // Solicitar firma de integridad a Supabase Edge Function
  async requestIntegritySignature(
    request: BoldSignatureRequest,
  ): Promise<BoldSignatureResponse> {
    // Obtener URL de la Edge Function
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/bold-signature`;

    const response = await fetch(edgeFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          `Edge Function failed with status ${response.status}`,
      );
    }

    const data = await response.json();
    return data;
  },

  // Crear registro de transacción Bold en Supabase
  async createBoldTransaction(
    transaction: BoldTransactionsInsert,
  ): Promise<BoldTransaction> {
    const { data, error } = await client
      .from("bold_transactions")
      .insert([transaction] as BoldTransactionsInsert[])
      .select()
      .single();

    if (error) throw error;
    return data as BoldTransaction;
  },

  // Actualizar estado de transacción Bold
  async updateBoldTransaction(
    orderId: string,
    updates: BoldTransactionsUpdate,
  ): Promise<BoldTransaction> {
    const { data, error } = await client
      .from("bold_transactions")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      } as BoldTransactionsUpdate)
      .eq("order_id", orderId)
      .select()
      .single();

    if (error) throw error;
    return data as BoldTransaction;
  },

  // Obtener transacción Bold por order_id
  async getBoldTransactionByOrderId(
    orderId: string,
  ): Promise<BoldTransaction | null> {
    const { data, error } = await client
      .from("bold_transactions")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // No encontrado
      throw error;
    }

    return data;
  },

  // Obtener transacciones Bold de un usuario
  async getUserBoldTransactions(userId: string): Promise<BoldTransaction[]> {
    const { data, error } = await client
      .from("bold_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Obtener transacciones Bold de un usuario con info del proyecto
  async getUserBoldTransactionsWithProjects(
    userId: string,
  ): Promise<import("@/types/bold.types").BoldTransactionWithProject[]> {
    const { data, error } = await client
      .from("bold_transactions")
      .select("*, project(project_id, name, category)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ||
      []) as import("@/types/bold.types").BoldTransactionWithProject[];
  },
};
