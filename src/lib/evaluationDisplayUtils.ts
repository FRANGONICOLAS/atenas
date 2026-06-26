export interface FantasticQuestionItem {
  key: string;
  question: string;
  answer: string;
  score?: string;
}

export interface FantasticLetterTab {
  id: string;
  label: string;
  title: string;
  questions: FantasticQuestionItem[];
}

export interface TechnicalMetricItem {
  key: string;
  label: string;
  value: string;
}

export interface TechnicalEvaluationTab {
  id: string;
  label: string;
  title: string;
  metrics: TechnicalMetricItem[];
}

export interface AnthropometricMetricItem {
  key: string;
  label: string;
  value: string;
}

export interface AnthropometricEvaluationTab {
  id: string;
  label: string;
  title: string;
  metrics: AnthropometricMetricItem[];
}

const fantasticLetterDefinition = [
  { id: "F", label: "F", title: "F - Familia y Amigos", min: 1, max: 5 },
  { id: "A1", label: "A", title: "A - Actividad Física", min: 6, max: 10 },
  { id: "N", label: "N", title: "N - Nutrición", min: 11, max: 15 },
  { id: "T1", label: "T", title: "T - Tabaco y Tóxicos", min: 16, max: 20 },
  { id: "A2", label: "A", title: "A - Alcohol", min: 21, max: 25 },
  { id: "S", label: "S", title: "S - Sueño y Estrés", min: 26, max: 30 },
  {
    id: "T2",
    label: "T",
    title: "T - Trabajo y Personalidad",
    min: 31,
    max: 35,
  },
  { id: "I", label: "I", title: "I - Introspección", min: 36, max: 40 },
  {
    id: "C",
    label: "C",
    title: "C - Conducción y Comportamiento Social",
    min: 41,
    max: 45,
  },
];

const formatDetailValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  if (typeof value === "boolean") {
    return value ? "Sí" : "No";
  }

  if (Array.isArray(value)) {
    return value.length === 0 ? "N/A" : value.join(", ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 0);
  }

  return String(value);
};

export const getFantasticLetterTabs = (
  detail?: Record<string, unknown>,
): FantasticLetterTab[] => {
  if (!detail || typeof detail !== "object" || Array.isArray(detail)) {
    return [];
  }

  const entries = Object.entries(detail)
    .filter(
      ([, value]) =>
        typeof value === "object" && value !== null && !Array.isArray(value),
    )
    .map(([key, value]) => ({
      key,
      number: Number((key.match(/(\d+)$/) ?? [])[0] ?? "0"),
      payload: value as Record<string, unknown>,
    }))
    .sort((a, b) => a.number - b.number);

  return fantasticLetterDefinition
    .map((group) => ({
      id: group.id,
      label: group.label,
      title: group.title,
      questions: entries
        .filter(
          (entry) => entry.number >= group.min && entry.number <= group.max,
        )
        .map((entry) => ({
          key: entry.key,
          question: String(
            entry.payload.question ?? entry.payload.pregunta ?? "",
          ),
          answer: String(
            entry.payload.answer ??
              entry.payload.respuesta ??
              formatDetailValue(entry.payload.value),
          ),
          score: formatDetailValue(entry.payload.value),
        })),
    }))
    .filter((group) => group.questions.length > 0);
};

const formatTechnicalLabel = (value: string) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const anthropometricFieldLabels: Record<string, string> = {
  genero: "Género",
  peso: "Peso (kg)",
  talla: "Talla (cm)",
  imc: "IMC",
  perimetro_cintura: "Perímetro Cintura",
  perimetro_cadera: "Perímetro Cadera",
  relacion_cintura_cadera: "Relación Cintura/Cadera",
  perimetro_brazo: "Perímetro Brazo",
  perimetro_muslo: "Perímetro Muslo",
  perimetro_pantorrilla: "Perímetro Pantorrilla",
  pliegue_tricipital: "Pliegue Tricipital",
  pliegue_bicipital: "Pliegue Bicipital",
  pliegue_subescapular: "Pliegue Subescapular",
  pliegue_suprailiaco: "Pliegue Suprailiaco",
  pliegue_abdominal: "Pliegue Abdominal",
  pliegue_muslo: "Pliegue Muslo",
  pliegue_pantorrilla: "Pliegue Pantorrilla",
  biacromial: "Biacromial",
  bicrestal: "Bicrestal",
  biepicondilar_humero: "Biepicondilar Húmero",
  biepicondilar_femur: "Biepicondilar Fémur",
  biestiloideo_muneca: "Biestiloideo Muñeca",
  bitrocantereo: "Bitrocantéreo",
  porcentaje_grasa: "Porcentaje de Grasa",
  masa_magra: "Masa Magra",
  masa_osea: "Masa Ósea",
  endomorfina: "Endomorfina",
  mesomorfina: "Mesomorfina",
  ectomorfina: "Ectomorfina",
};

const anthropometricSections = [
  {
    id: "medidas",
    label: "Medidas",
    title: "Medidas Antropométricas",
    fields: [
      "genero",
      "peso",
      "talla",
      "imc",
      "perimetro_cintura",
      "perimetro_cadera",
      "relacion_cintura_cadera",
      "perimetro_brazo",
      "perimetro_muslo",
      "perimetro_pantorrilla",
    ],
  },
  {
    id: "pliegues",
    label: "Pliegues",
    title: "Pliegues Cutáneos",
    fields: [
      "pliegue_tricipital",
      "pliegue_bicipital",
      "pliegue_subescapular",
      "pliegue_suprailiaco",
      "pliegue_abdominal",
      "pliegue_muslo",
      "pliegue_pantorrilla",
    ],
  },
  {
    id: "diametros",
    label: "Diámetros",
    title: "Diámetros Óseos",
    fields: [
      "biacromial",
      "bicrestal",
      "biepicondilar_humero",
      "biepicondilar_femur",
      "biestiloideo_muneca",
      "bitrocantereo",
    ],
  },
  {
    id: "composicion",
    label: "Composición",
    title: "Composición Corporal Estimada",
    fields: ["porcentaje_grasa", "masa_magra", "masa_osea"],
  },
  {
    id: "somatotipo",
    label: "Somatotipo",
    title: "Evaluación del Somatotipo",
    fields: ["endomorfina", "mesomorfina", "ectomorfina"],
  },
];

export const getAnthropometricEvaluationTabs = (
  detail?: Record<string, unknown>,
): AnthropometricEvaluationTab[] => {
  if (!detail || typeof detail !== "object" || Array.isArray(detail)) {
    return [];
  }

  return anthropometricSections
    .map((section) => ({
      id: section.id,
      label: section.label,
      title: section.title,
      metrics: section.fields.map((field) => ({
        key: field,
        label: anthropometricFieldLabels[field] ?? formatTechnicalLabel(field),
        value: formatDetailValue(detail[field]),
      })),
    }))
    .filter((section) =>
      section.metrics.some((metric) => metric.value !== "N/A"),
    );
};

export const getTechnicalEvaluationTabs = (
  detail?: Record<string, unknown>,
): TechnicalEvaluationTab[] => {
  if (!detail || typeof detail !== "object" || Array.isArray(detail)) {
    return [];
  }

  return Object.entries(detail)
    .filter(
      ([, value]) =>
        typeof value === "object" && value !== null && !Array.isArray(value),
    )
    .map(([categoryKey, categoryValue]) => ({
      id: categoryKey,
      label: formatTechnicalLabel(categoryKey),
      title: formatTechnicalLabel(categoryKey),
      metrics: Object.entries(categoryValue as Record<string, unknown>).map(
        ([metricKey, metricValue]) => ({
          key: metricKey,
          label: formatTechnicalLabel(metricKey),
          value: formatDetailValue(metricValue),
        }),
      ),
    }));
};
