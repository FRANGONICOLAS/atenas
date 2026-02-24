import { client } from "@/api/supabase/client";
import { storageService } from "./storage.service";
import type {
  Beneficiary,
  CreateBeneficiaryData,
  UpdateBeneficiaryData,
} from "@/types/beneficiary.types";

type EvaluationPayload = Pick<
  CreateBeneficiaryData,
  "anthropometric_detail" | "technical_tactic_detail" | "emotional_detail"
>;

const hasEvaluationPayload = (payload: EvaluationPayload) => {
  return Boolean(
    payload.anthropometric_detail ||
      payload.technical_tactic_detail ||
      payload.emotional_detail
  );
};

const extractEvaluationPayload = (payload: EvaluationPayload) => ({
  anthropometric_detail: payload.anthropometric_detail ?? null,
  technical_tactic_detail: payload.technical_tactic_detail ?? null,
  emotional_detail: payload.emotional_detail ?? null,
});

const stripEvaluationFields = <T extends EvaluationPayload>(payload: T) => {
  const {
    anthropometric_detail,
    technical_tactic_detail,
    emotional_detail,
    ...rest
  } = payload;
  return rest;
};

const createEvaluation = async (payload: EvaluationPayload) => {
  const { data, error } = await client
    .from("evaluation")
    .insert([extractEvaluationPayload(payload)])
    .select("id, created_at, anthropometric_detail, technical_tactic_detail, emotional_detail")
    .single();

  if (error) throw error;
  return data;
};

const linkBeneficiaryEvaluation = async (
  beneficiaryId: string,
  evaluationId: string
) => {
  const { error } = await client
    .from("beneficiary's_evaluation")
    .insert([
      {
        beneficiary_id: beneficiaryId,
        evaluation_id: evaluationId,
      },
    ]);

  if (error) throw error;
};

const loadLatestEvaluations = async (beneficiaryIds: string[]) => {
  if (beneficiaryIds.length === 0) {
    return new Map<string, any>();
  }

  const { data, error } = await client
    .from("beneficiary's_evaluation")
    .select(
      "beneficiary_id, evaluation: evaluation_id (id, created_at, anthropometric_detail, technical_tactic_detail, emotional_detail)"
    )
    .in("beneficiary_id", beneficiaryIds);

  if (error) throw error;

  const latestByBeneficiary = new Map<string, any>();

  (data || []).forEach((row: any) => {
    if (!row?.evaluation) return;
    const evaluation = row.evaluation;
    const existing = latestByBeneficiary.get(row.beneficiary_id);
    const evaluationDate = evaluation.created_at
      ? new Date(evaluation.created_at).getTime()
      : 0;
    const existingDate = existing?.created_at
      ? new Date(existing.created_at).getTime()
      : 0;

    if (!existing || evaluationDate >= existingDate) {
      latestByBeneficiary.set(row.beneficiary_id, evaluation);
    }
  });

  return latestByBeneficiary;
};

const attachLatestEvaluation = async (beneficiaries: Beneficiary[]) => {
  if (beneficiaries.length === 0) return beneficiaries;

  const latestByBeneficiary = await loadLatestEvaluations(
    beneficiaries.map((b) => b.beneficiary_id)
  );

  return beneficiaries.map((beneficiary) => {
    const latest = latestByBeneficiary.get(beneficiary.beneficiary_id);
    if (!latest) return beneficiary;

    return {
      ...beneficiary,
      anthropometric_detail: latest.anthropometric_detail ?? undefined,
      technical_tactic_detail: latest.technical_tactic_detail ?? undefined,
      emotional_detail: latest.emotional_detail ?? undefined,
      latest_evaluation: latest,
    };
  });
};

export const beneficiaryService = {
  // Obtiene todos los beneficiarios
  async getAll(): Promise<Beneficiary[]> {
    const { data, error } = await client
      .from("beneficiary")
      .select("*")
      .order("registry_date", { ascending: false });

    if (error) throw error;
    return await attachLatestEvaluation(data || []);
  },

  // Obtiene un beneficiario por su ID
  async getById(id: string): Promise<Beneficiary | null> {
    const { data, error } = await client
      .from("beneficiary")
      .select("*")
      .eq("beneficiary_id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    const [beneficiary] = await attachLatestEvaluation([data]);
    return beneficiary;
  },

  // Obtiene todos los beneficiarios de una sede específica
  async getByHeadquarterId(headquarterId: string): Promise<Beneficiary[]> {
    const { data, error } = await client
      .from("beneficiary")
      .select("*")
      .eq("headquarters_id", headquarterId)
      .order("registry_date", { ascending: false });

    if (error) throw error;
    return await attachLatestEvaluation(data || []);
  },

  // Obtiene beneficiarios por categoría
  async getByCategory(category: string): Promise<Beneficiary[]> {
    const { data, error } = await client
      .from("beneficiary")
      .select("*")
      .eq("category", category)
      .order("registry_date", { ascending: false });

    if (error) throw error;
    return await attachLatestEvaluation(data || []);
  },

  // Obtiene beneficiarios por sede y categoría
  async getByHeadquarterAndCategory(
    headquarterId: string,
    category: string,
  ): Promise<Beneficiary[]> {
    const { data, error } = await client
      .from("beneficiary")
      .select("*")
      .eq("headquarters_id", headquarterId)
      .eq("category", category)
      .order("registry_date", { ascending: false });

    if (error) throw error;
    return await attachLatestEvaluation(data || []);
  },

  // Busca beneficiarios por nombre o apellido
  async searchByName(searchTerm: string): Promise<Beneficiary[]> {
    const { data, error } = await client
      .from("beneficiary")
      .select("*")
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
      .order("first_name", { ascending: true });

    if (error) throw error;
    return await attachLatestEvaluation(data || []);
  },

  /**
   * Obtiene beneficiarios por estado
   */
  async getByStatus(status: string): Promise<Beneficiary[]> {
    const { data, error } = await client
      .from("beneficiary")
      .select("*")
      .eq("status", status)
      .order("registry_date", { ascending: false });

    if (error) throw error;
    return await attachLatestEvaluation(data || []);
  },

  /**
   * Obtiene beneficiarios con bajo rendimiento
   */
  async getLowPerformance(threshold: number = 60): Promise<Beneficiary[]> {
    const { data, error } = await client
      .from("beneficiary")
      .select("*")
      .lt("performance", threshold)
      .order("performance", { ascending: true });

    if (error) throw error;
    return await attachLatestEvaluation(data || []);
  },

  // Crea un nuevo beneficiario
  async create(beneficiaryData: CreateBeneficiaryData): Promise<Beneficiary> {
    const evaluationPayload = extractEvaluationPayload(beneficiaryData);
    const shouldCreateEvaluation = hasEvaluationPayload(beneficiaryData);
    const beneficiaryPayload = stripEvaluationFields(beneficiaryData);

    const { data, error } = await client
      .from("beneficiary")
      .insert([
        {
          headquarters_id: beneficiaryPayload.headquarters_id,
          first_name: beneficiaryPayload.first_name,
          last_name: beneficiaryPayload.last_name,
          birth_date: beneficiaryPayload.birth_date,
          category: beneficiaryPayload.category,
          phone: beneficiaryPayload.phone,
          registry_date:
            beneficiaryPayload.registry_date ||
            new Date().toISOString().split("T")[0],
          status: beneficiaryPayload.status || "activo",
          sex: beneficiaryPayload.sex,
          performance: beneficiaryPayload.performance,
          guardian: beneficiaryPayload.guardian,
          address: beneficiaryPayload.address,
          emergency_contact: beneficiaryPayload.emergency_contact,
          medical_info: beneficiaryPayload.medical_info,
          observation: beneficiaryPayload.observation,
          photo_url: beneficiaryPayload.photo_url ?? null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    if (!shouldCreateEvaluation) {
      return data;
    }

    const evaluation = await createEvaluation(evaluationPayload);
    await linkBeneficiaryEvaluation(data.beneficiary_id, evaluation.id);

    return {
      ...data,
      anthropometric_detail: evaluation.anthropometric_detail ?? undefined,
      technical_tactic_detail: evaluation.technical_tactic_detail ?? undefined,
      emotional_detail: evaluation.emotional_detail ?? undefined,
      latest_evaluation: evaluation,
    };
  },

  // Actualiza un beneficiario existente
  async update(
    beneficiaryId: string,
    updates: UpdateBeneficiaryData,
  ): Promise<Beneficiary> {
    const evaluationPayload = extractEvaluationPayload(updates);
    const shouldCreateEvaluation = hasEvaluationPayload(updates);
    const beneficiaryUpdates = stripEvaluationFields(updates);

    const { data, error } = await client
      .from("beneficiary")
      .update(beneficiaryUpdates)
      .eq("beneficiary_id", beneficiaryId)
      .select()
      .single();

    if (error) throw error;

    if (!shouldCreateEvaluation) {
      return data;
    }

    const evaluation = await createEvaluation(evaluationPayload);
    await linkBeneficiaryEvaluation(beneficiaryId, evaluation.id);

    return {
      ...data,
      anthropometric_detail: evaluation.anthropometric_detail ?? undefined,
      technical_tactic_detail: evaluation.technical_tactic_detail ?? undefined,
      emotional_detail: evaluation.emotional_detail ?? undefined,
      latest_evaluation: evaluation,
    };
  },

  // Elimina un beneficiario
  async delete(beneficiaryId: string): Promise<void> {
    const { error } = await client
      .from("beneficiary")
      .delete()
      .eq("beneficiary_id", beneficiaryId);

    if (error) throw error;
  },

  // Cuenta el total de beneficiarios
  async count(): Promise<number> {
    const { count, error } = await client
      .from("beneficiary")
      .select("*", { count: "exact", head: true });

    if (error) throw error;
    return count || 0;
  },

  // Cuenta beneficiarios por sede
  async countByHeadquarter(headquarterId: string): Promise<number> {
    const { count, error } = await client
      .from("beneficiary")
      .select("*", { count: "exact", head: true })
      .eq("headquarters_id", headquarterId);

    if (error) throw error;
    return count || 0;
  },

  // Cuenta beneficiarios por categoría
  async countByCategory(category: string): Promise<number> {
    const { count, error } = await client
      .from("beneficiary")
      .select("*", { count: "exact", head: true })
      .eq("category", category);

    if (error) throw error;
    return count || 0;
  },

  // Sube una foto de perfil de beneficiario y retorna la URL
  async uploadPhoto(beneficiaryId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${beneficiaryId}-${Date.now()}.${fileExt}`;
    const filePath = `beneficiaries/${fileName}`;

    // Subir archivo
    await storageService.uploadFile('images', filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

    // Obtener URL pública
    const publicUrl = storageService.getPublicUrl('images', filePath);
    return publicUrl;
  },
};
