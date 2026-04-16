import { client } from "@/api/supabase/client";
import { storageService } from "./storage.service";
import type { BeneficiaryRow, EvaluationRow, Json } from "@/api/types";
import type {
  Beneficiary,
  CreateBeneficiaryData,
  UpdateBeneficiaryData,
} from "@/types/beneficiary.types";
import type { EvaluationType } from "@/types";
import {
  buildEvaluationInsertPayload,
  hasEvaluationDetail,
  normalizeEvaluationType,
} from "@/lib/evaluationUtils";

interface LatestEvaluationLookupRow {
  beneficiary_id: string;
  evaluation: EvaluationRow | null;
}

interface LatestEvaluationBucket {
  latest: EvaluationRow | null;
  anthropometric: EvaluationRow | null;
  technical: EvaluationRow | null;
  emotional: EvaluationRow | null;
}

type EvaluationPayload = Pick<
  CreateBeneficiaryData,
  "anthropometric_detail" | "technical_tactic_detail" | "emotional_detail"
>;

const getEvaluationTimestamp = (evaluation: EvaluationRow | null) => {
  if (!evaluation?.created_at) return 0;
  return new Date(evaluation.created_at).getTime();
};

const createEvaluation = async (type: EvaluationType, detail: Json) => {
  const payload = buildEvaluationInsertPayload({
    type,
    anthropometric_detail: type === "ANTHROPOMETRIC" ? detail : null,
    technical_tactic_detail: type === "TECHNICAL" ? detail : null,
    emotional_detail: type === "EMOTIONAL" ? detail : null,
  });

  const { data, error } = await client
    .from("evaluation")
    .insert([payload])
    .select(
      "id, created_at, type, anthropometric_detail, technical_tactic_detail, emotional_detail",
    )
    .single();

  if (error) throw error;
  return data as EvaluationRow;
};

const extractEvaluationEntries = (payload: EvaluationPayload) => {
  const entries: Array<{ type: EvaluationType; detail: Json }> = [];

  if (hasEvaluationDetail(payload.anthropometric_detail)) {
    entries.push({
      type: "ANTHROPOMETRIC",
      detail: payload.anthropometric_detail as Json,
    });
  }

  if (hasEvaluationDetail(payload.technical_tactic_detail)) {
    entries.push({
      type: "TECHNICAL",
      detail: payload.technical_tactic_detail as Json,
    });
  }

  if (hasEvaluationDetail(payload.emotional_detail)) {
    entries.push({
      type: "EMOTIONAL",
      detail: payload.emotional_detail as Json,
    });
  }

  return entries;
};

const stripEvaluationFields = <T extends EvaluationPayload>(payload: T) => {
  const {
    anthropometric_detail,
    technical_tactic_detail,
    emotional_detail,
    ...rest
  } = payload;
  return rest;
};

const linkBeneficiaryEvaluation = async (
  beneficiaryId: string,
  evaluationId: string,
) => {
  const { error } = await client.from("beneficiary's_evaluation").insert([
    {
      beneficiary_id: beneficiaryId,
      evaluation_id: evaluationId,
    },
  ]);

  if (error) throw error;
};

const loadLatestEvaluations = async (beneficiaryIds: string[]) => {
  if (beneficiaryIds.length === 0) {
    return new Map<string, LatestEvaluationBucket>();
  }

  const { data, error } = await client
    .from("beneficiary's_evaluation")
    .select(
      "beneficiary_id, evaluation: evaluation_id (id, created_at, type, anthropometric_detail, technical_tactic_detail, emotional_detail)",
    )
    .in("beneficiary_id", beneficiaryIds);

  if (error) throw error;

  const latestByBeneficiary = new Map<string, LatestEvaluationBucket>();

  ((data as LatestEvaluationLookupRow[]) || []).forEach((row) => {
    if (!row?.evaluation) return;
    const evaluation = row.evaluation;
    const existing = latestByBeneficiary.get(row.beneficiary_id) ?? {
      latest: null,
      anthropometric: null,
      technical: null,
      emotional: null,
    };
    const evaluationDate = getEvaluationTimestamp(evaluation);

    if (evaluationDate >= getEvaluationTimestamp(existing.latest)) {
      existing.latest = evaluation;
    }

    switch (normalizeEvaluationType(evaluation.type)) {
      case "ANTHROPOMETRIC":
        if (evaluationDate >= getEvaluationTimestamp(existing.anthropometric)) {
          existing.anthropometric = evaluation;
        }
        break;
      case "TECHNICAL":
        if (evaluationDate >= getEvaluationTimestamp(existing.technical)) {
          existing.technical = evaluation;
        }
        break;
      case "EMOTIONAL":
        if (evaluationDate >= getEvaluationTimestamp(existing.emotional)) {
          existing.emotional = evaluation;
        }
        break;
    }

    latestByBeneficiary.set(row.beneficiary_id, existing);
  });

  return latestByBeneficiary;
};

const mapBeneficiaryRow = (row: BeneficiaryRow): Beneficiary => ({
  beneficiary_id: row.beneficiary_id,
  headquarters_id: row.headquarters_id,
  first_name: row.first_name,
  last_name: row.last_name,
  birth_date: row.birth_date ?? "",
  category: row.category ?? "",
  phone: row.phone ?? "",
  registry_date: row.registry_date ?? "",
  status: row.status ?? undefined,
  gender: row.gender ?? undefined,
  performance: row.performance ?? undefined,
  guardian: row.guardian ?? undefined,
  address: row.address ?? undefined,
  emergency_contact: row.emergency_contact ?? undefined,
  medical_info: row.medical_info ?? undefined,
  photo_url: row.photo_url ?? null,
  observation: row.observation ?? undefined,
  created_at: row.created_at ?? undefined,
});

const attachLatestEvaluation = async (
  rows: BeneficiaryRow[],
): Promise<Beneficiary[]> => {
  if (rows.length === 0) return [];

  const beneficiaries: Beneficiary[] = rows.map(mapBeneficiaryRow);

  const latestByBeneficiary = await loadLatestEvaluations(
    beneficiaries.map((b) => b.beneficiary_id),
  );

  return beneficiaries.map((beneficiary) => {
    const latest = latestByBeneficiary.get(beneficiary.beneficiary_id);
    if (!latest) return beneficiary;

    return {
      ...beneficiary,
      anthropometric_detail:
        latest.anthropometric?.anthropometric_detail ?? undefined,
      technical_tactic_detail:
        latest.technical?.technical_tactic_detail ?? undefined,
      emotional_detail: latest.emotional?.emotional_detail ?? undefined,
      latest_evaluation: latest.latest ?? undefined,
    };
  });
};

export const beneficiaryService = {
  // Obtiene beneficiarios públicos sin datos de evaluación
  async getPublicAll(): Promise<Beneficiary[]> {
    const { data, error } = await client
      .from("beneficiary")
      .select("*")
      .order("registry_date", { ascending: false });

    if (error) throw error;
    return (data || []).map(mapBeneficiaryRow);
  },

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
    return beneficiary ?? null;
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
    const evaluationEntries = extractEvaluationEntries(beneficiaryData);
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
          gender: beneficiaryPayload.gender,
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

    if (evaluationEntries.length === 0) {
      return mapBeneficiaryRow(data);
    }

    for (const entry of evaluationEntries) {
      const evaluation = await createEvaluation(entry.type, entry.detail);
      await linkBeneficiaryEvaluation(data.beneficiary_id, evaluation.id);
    }

    const [beneficiary] = await attachLatestEvaluation([data]);
    return beneficiary ?? mapBeneficiaryRow(data);
  },

  // Actualiza un beneficiario existente
  async update(
    beneficiaryId: string,
    updates: UpdateBeneficiaryData,
  ): Promise<Beneficiary> {
    const evaluationEntries = extractEvaluationEntries(updates);
    const beneficiaryUpdates = stripEvaluationFields(updates);

    const { data, error } = await client
      .from("beneficiary")
      .update(beneficiaryUpdates)
      .eq("beneficiary_id", beneficiaryId)
      .select()
      .single();

    if (error) throw error;

    if (evaluationEntries.length === 0) {
      return mapBeneficiaryRow(data);
    }

    for (const entry of evaluationEntries) {
      const evaluation = await createEvaluation(entry.type, entry.detail);
      await linkBeneficiaryEvaluation(beneficiaryId, evaluation.id);
    }

    const [beneficiary] = await attachLatestEvaluation([data]);
    return beneficiary ?? mapBeneficiaryRow(data);
  },

  // Elimina un beneficiario
  async delete(beneficiaryId: string): Promise<void> {
    const { error } = await client
      .from("beneficiary")
      .delete()
      .eq("beneficiary_id", beneficiaryId);

    if (error) throw error;
  },

  // Cuenta evaluaciones de un beneficiario
  async countEvaluations(beneficiaryId: string): Promise<number> {
    const { count, error } = await client
      .from("beneficiary's_evaluation")
      .select("*", { count: "exact", head: true })
      .eq("beneficiary_id", beneficiaryId);

    if (error) throw error;
    return count || 0;
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
    const fileExt = file.name.split(".").pop();
    const fileName = `${beneficiaryId}-${Date.now()}.${fileExt}`;
    const filePath = `beneficiaries/${fileName}`;

    // Subir archivo
    await storageService.uploadFile("images", filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

    // Obtener URL pública
    const publicUrl = storageService.getPublicUrl("images", filePath);
    return publicUrl;
  },
};
