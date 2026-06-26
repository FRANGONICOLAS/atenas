import type { EvaluationType, EvaluationReport } from "@/types";

export type { EvaluationReport };
import type jsPDF from "jspdf";

export interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

export interface ReportMetadata {
  generatedBy?: string;
  headquartersName?: string;
}

export interface DonationReport {
  id: number;
  donor: string;
  amount: number;
  project: string;
  date: string;
  status: string;
}

export type { EvaluationType };

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const translateProjectType = (type: string) => {
  switch (type) {
    case "investment":
      return "Inversión";
    case "free":
      return "Libre";
    default:
      return type;
  }
};

export const translateProjectStatus = (status: string) => {
  switch (status) {
    case "active":
      return "Activo";
    case "completed":
      return "Completado";
    case "pending":
      return "Pendiente";
    default:
      return status;
  }
};

export const formatEvaluationValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }
  if (typeof value === "boolean") {
    return value ? "Sí" : "No";
  }
  if (typeof value === "object") {
    return String(value);
  }
  return String(value);
};

export const evaluationTypeLabels: Record<EvaluationType, string> = {
  ANTHROPOMETRIC: "Antropométrica",
  TECHNICAL: "Técnico-Táctica",
  EMOTIONAL: "Emocional",
};

export const formatEvaluationLabel = (value: string): string => {
  const labelMap: Record<string, string> = {
    genero: "Género",
    peso: "Peso",
    talla: "Talla",
    imc: "IMC",
    perimetro_cintura: "Perímetro cintura",
    perimetro_cadera: "Perímetro cadera",
    relacion_cintura_cadera: "Relación cintura/cadera",
    perimetro_brazo: "Perímetro brazo",
    perimetro_muslo: "Perímetro muslo",
    perimetro_pantorrilla: "Perímetro pantorrilla",
    pliegue_tricipital: "Pliegue tricipital",
    pliegue_bicipital: "Pliegue bicipital",
    pliegue_subescapular: "Pliegue subescapular",
    pliegue_suprailiaco: "Pliegue suprailiaco",
    pliegue_abdominal: "Pliegue abdominal",
    pliegue_muslo: "Pliegue muslo",
    pliegue_pantorrilla: "Pliegue pantorrilla",
    biacromial: "Diámetro biacromial",
    bicrestal: "Diámetro bicrestal",
    biepicondilar_humero: "Biepicondilar húmero",
    biepicondilar_femur: "Biepicondilar fémur",
    biestiloideo_muneca: "Biestiloideo muñeca",
    bitrocantereo: "Bitrocantéreo",
    porcentaje_grasa: "Porcentaje de grasa",
    masa_magra: "Masa magra",
    masa_osea: "Masa ósea",
    endomorfina: "Endomorfina",
    mesomorfina: "Mesomorfina",
    ectomorfina: "Ectomorfina",
    pase: "Pase",
    recepcion: "Recepción",
    remate: "Remate",
    regate: "Regate",
    ubicacion_espacio_temporal: "Ubicación espacio-temporal",
    observaciones: "Observaciones",
    question: "Pregunta",
    pregunta: "Pregunta",
    answer: "Respuesta",
    respuesta: "Respuesta",
    value: "Valor",
  };

  return (
    labelMap[value] ||
    value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
  );
};

export const formatSection = (title: string, lines: string[]) => {
  if (lines.length === 0) return "";
  return [title, ...lines.map((line) => `  ${line}`)].join("\n");
};

export const renderAnthropometricDetail = (
  detail: Record<string, unknown>,
): string => {
  const sectionFields = [
    {
      title: "Medidas antropométricas",
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
      title: "Pliegues cutáneos",
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
      title: "Diámetros óseos",
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
      title: "Composición corporal",
      fields: ["porcentaje_grasa", "masa_magra", "masa_osea"],
    },
    {
      title: "Somatotipo",
      fields: ["endomorfina", "mesomorfina", "ectomorfina"],
    },
  ];

  const sections = sectionFields
    .map((section) => {
      const lines = section.fields
        .filter(
          (field) => detail[field] !== undefined && detail[field] !== null,
        )
        .map(
          (field) =>
            `${formatEvaluationLabel(field)}: ${formatEvaluationValue(
              detail[field],
            )}`,
        );
      return formatSection(section.title, lines);
    })
    .filter(Boolean);

  return sections.filter((section) => section.trim().length > 0).join("\n\n");
};

export const renderTechnicalDetail = (detail: Record<string, unknown>): string => {
  const categories = Object.entries(detail).filter(
    ([, value]) => typeof value === "object" && value !== null,
  );

  const sections = categories.map(([categoryKey, categoryValue]) => {
    const payload = categoryValue as Record<string, unknown>;
    const lines = Object.entries(payload).map(
      ([metricKey, metricValue]) =>
        `${formatEvaluationLabel(metricKey)}: ${formatEvaluationValue(
          metricValue,
        )}`,
    );
    return formatSection(formatEvaluationLabel(categoryKey), lines);
  });

  return sections.filter((section) => section.trim().length > 0).join("\n\n");
};

export const renderEmotionalDetail = (detail: Record<string, unknown>): string => {
  const sections = [
    { id: "F", title: "Familia y Amigos", min: 1, max: 5 },
    { id: "A1", title: "Actividad Física", min: 6, max: 10 },
    { id: "N", title: "Nutrición", min: 11, max: 15 },
    { id: "T1", title: "Tabaco y Tóxicos", min: 16, max: 20 },
    { id: "A2", title: "Alcohol", min: 21, max: 25 },
    { id: "S", title: "Sueño y Estrés", min: 26, max: 30 },
    { id: "T2", title: "Trabajo y Personalidad", min: 31, max: 35 },
    { id: "I", title: "Introspección", min: 36, max: 40 },
    { id: "C", title: "Conducción y Comportamiento Social", min: 41, max: 45 },
  ];

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

  const sectionTexts = sections
    .map((section) => {
      const lines = entries
        .filter(
          (entry) => entry.number >= section.min && entry.number <= section.max,
        )
        .map((entry) => {
          const question = String(
            entry.payload.question ??
              entry.payload.pregunta ??
              `Pregunta ${entry.number || ""}`,
          ).trim();
          const answer = String(
            entry.payload.answer ??
              entry.payload.respuesta ??
              formatEvaluationValue(entry.payload.value),
          );
          return `Pregunta: ${question} - Respuesta: ${answer}`;
        });

      return formatSection(section.title, lines);
    })
    .filter((section) => section.trim().length > 0);

  return sectionTexts.join("\n\n");
};

export const formatEvaluationDetails = (
  detail?: Record<string, unknown> | null,
  type?: EvaluationType,
): string => {
  if (!detail || Object.keys(detail).length === 0) {
    return "Sin preguntas registradas.";
  }

  if (type === "ANTHROPOMETRIC") {
    return renderAnthropometricDetail(detail);
  }

  if (type === "TECHNICAL") {
    return renderTechnicalDetail(detail);
  }

  if (type === "EMOTIONAL") {
    return renderEmotionalDetail(detail);
  }

  return Object.entries(detail)
    .map(
      ([key, value]) =>
        `${formatEvaluationLabel(key)}: ${formatEvaluationValue(value)}`,
    )
    .join("\n");
};
