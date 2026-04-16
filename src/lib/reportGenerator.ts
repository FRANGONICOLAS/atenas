import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type {
  ProjectReport,
  BeneficiaryReport,
  UserReport,
  EvaluationReport,
  EvaluationType,
} from "@/types";

// Tipo extendido para jsPDF con autoTable
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

interface ReportMetadata {
  generatedBy?: string;
  headquartersName?: string;
}

// Re-export tipos para compatibilidad
export type { ProjectReport, BeneficiaryReport, UserReport };

// Tipos para los reportes (internos)
export interface DonationReport {
  id: number;
  donor: string;
  amount: number;
  project: string;
  date: string;
  status: string;
}

// Utilidad para formatear moneda
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Utilidad para formatear fecha
const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const translateProjectType = (type: string) => {
  switch (type) {
    case "investment":
      return "Inversión";
    case "free":
      return "Libre";
    default:
      return type;
  }
};

const translateProjectStatus = (status: string) => {
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

// Generar reporte de donaciones en Excel
export const generateDonationsExcel = (
  donations: DonationReport[],
  fileName = "reporte_donaciones",
) => {
  const data = donations.map((d) => ({
    ID: d.id,
    Donante: d.donor,
    Monto: formatCurrency(d.amount),
    Proyecto: d.project,
    Fecha: formatDate(d.date),
    Estado: d.status,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();

  // Configurar ancho de columnas
  ws["!cols"] = [
    { wch: 8 }, // ID
    { wch: 25 }, // Donante
    { wch: 15 }, // Monto
    { wch: 30 }, // Proyecto
    { wch: 20 }, // Fecha
    { wch: 12 }, // Estado
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Donaciones");
  XLSX.writeFile(wb, `${fileName}_${Date.now()}.xlsx`);
};

// Generar reporte de usuarios en Excel
export const generateUsersExcel = (
  users: UserReport[],
  fileName = "reporte_usuarios",
) => {
  const data = users.map((u) => ({
    ID: u.id,
    Nombre: u.name,
    Email: u.email,
    Rol: u.role,
    Estado: u.status,
    "Fecha Registro": formatDate(u.date),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();

  ws["!cols"] = [
    { wch: 8 }, // ID
    { wch: 25 }, // Nombre
    { wch: 30 }, // Email
    { wch: 12 }, // Rol
    { wch: 12 }, // Estado
    { wch: 20 }, // Fecha
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Usuarios");
  XLSX.writeFile(wb, `${fileName}_${Date.now()}.xlsx`);
};

// Generar reporte de proyectos en Excel
export const generateProjectsExcel = (
  projects: ProjectReport[],
  fileName = "reporte_proyectos",
  metadata?: ReportMetadata,
) => {
  const rows: (string | number)[][] = [];
  rows.push(["Reporte de Proyectos"]);
  rows.push(["Fecha", formatDate(new Date().toISOString())]);
  if (metadata?.generatedBy) {
    rows.push(["Generado por", metadata.generatedBy]);
  }
  if (metadata?.headquartersName) {
    rows.push(["Sede", metadata.headquartersName]);
  }
  rows.push([]);

  rows.push([
    "Nombre",
    "Categoría",
    "Tipo",
    "Sede",
    "Meta",
    "Recaudado",
    "Progreso %",
    "Estado",
  ]);

  const dataRows = projects.map((p) => [
    p.name,
    p.category,
    translateProjectType(p.type),
    p.headquarter,
    formatCurrency(p.goal),
    formatCurrency(p.raised),
    `${p.progress}%`,
    translateProjectStatus(p.status),
  ]);

  const ws = XLSX.utils.aoa_to_sheet([...rows, ...dataRows]);
  const wb = XLSX.utils.book_new();

  ws["!cols"] = [
    { wch: 30 }, // Nombre
    { wch: 15 }, // Categoría
    { wch: 12 }, // Tipo
    { wch: 25 }, // Sede
    { wch: 15 }, // Meta
    { wch: 15 }, // Recaudado
    { wch: 12 }, // Progreso
    { wch: 12 }, // Estado
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Proyectos");
  XLSX.writeFile(wb, `${fileName}_${Date.now()}.xlsx`);
};

// Generar reporte de beneficiarios en Excel
export const generateBeneficiariesExcel = (
  beneficiaries: BeneficiaryReport[],
  fileName = "reporte_beneficiarios",
  metadata?: ReportMetadata,
) => {
  const rows: (string | number)[][] = [];
  rows.push(["Reporte de Beneficiarios"]);
  rows.push(["Fecha", formatDate(new Date().toISOString())]);
  if (metadata?.generatedBy) {
    rows.push(["Generado por", metadata.generatedBy]);
  }
  if (metadata?.headquartersName) {
    rows.push(["Sede", metadata.headquartersName]);
  }
  rows.push([]);

  rows.push([
    "Nombre completo",
    "Edad",
    "Categoría",
    "Sede",
    "Director de sede",
    "Teléfono",
    "Acudiente",
  ]);

  const dataRows = beneficiaries.map((b) => [
    `${b.first_name} ${b.last_name}`,
    b.age || "N/A",
    b.category,
    b.headquarter_name || b.headquarters_id,
    b.headquarter_director || "No disponible",
    b.phone,
    b.guardian || "No disponible",
  ]);

  const ws = XLSX.utils.aoa_to_sheet([...rows, ...dataRows]);
  const wb = XLSX.utils.book_new();

  ws["!cols"] = [
    { wch: 30 }, // Nombre completo
    { wch: 8 }, // Edad
    { wch: 15 }, // Categoría
    { wch: 25 }, // Sede
    { wch: 25 }, // Director de sede
    { wch: 15 }, // Teléfono
    { wch: 25 }, // Acudiente
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Beneficiarios");
  XLSX.writeFile(wb, `${fileName}_${Date.now()}.xlsx`);
};

/**
 * GENERACIÓN DE REPORTES EN PDF
 */

// Generar reporte de donaciones en PDF
export const generateDonationsPDF = (
  donations: DonationReport[],
  fileName = "reporte_donaciones",
) => {
  const doc = new jsPDF();

  // Título
  doc.setFontSize(18);
  doc.text("Reporte de Donaciones", 14, 22);

  // Fecha de generación
  doc.setFontSize(10);
  doc.text(`Generado: ${formatDate(new Date().toISOString())}`, 14, 30);

  // Tabla
  autoTable(doc, {
    head: [["ID", "Donante", "Monto", "Proyecto", "Fecha", "Estado"]],
    body: donations.map((d) => [
      d.id,
      d.donor,
      formatCurrency(d.amount),
      d.project,
      formatDate(d.date),
      d.status,
    ]),
    startY: 35,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  // Total
  const total = donations.reduce((sum, d) => sum + d.amount, 0);
  const finalY = (doc as jsPDFWithAutoTable).lastAutoTable?.finalY || 35;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Total: ${formatCurrency(total)}`, 14, finalY + 10);

  doc.save(`${fileName}_${Date.now()}.pdf`);
};

// Generar reporte de usuarios en PDF
export const generateUsersPDF = (
  users: UserReport[],
  fileName = "reporte_usuarios",
) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Reporte de Usuarios", 14, 22);

  doc.setFontSize(10);
  doc.text(`Generado: ${formatDate(new Date().toISOString())}`, 14, 30);

  autoTable(doc, {
    head: [["ID", "Nombre", "Email", "Rol", "Estado", "Fecha Registro"]],
    body: users.map((u) => [
      u.id,
      u.name,
      u.email,
      u.role,
      u.status,
      formatDate(u.date),
    ]),
    startY: 35,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  const finalY = (doc as jsPDFWithAutoTable).lastAutoTable.finalY || 35;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Usuarios: ${users.length}`, 14, finalY + 10);

  doc.save(`${fileName}_${Date.now()}.pdf`);
};

// Generar reporte de proyectos en PDF
export const generateProjectsPDF = (
  projects: ProjectReport[],
  fileName = "reporte_proyectos",
  metadata?: ReportMetadata,
) => {
  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Reporte de Proyectos", 14, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Fecha: ${formatDate(new Date().toISOString())}`, 14, 30);

  let currentY = 36;
  if (metadata?.generatedBy) {
    doc.text(`Generado por: ${metadata.generatedBy}`, 14, currentY);
    currentY += 6;
  }
  if (metadata?.headquartersName) {
    doc.text(`Sede: ${metadata.headquartersName}`, 14, currentY);
    currentY += 6;
  }

  autoTable(doc, {
    head: [
      [
        "Nombre",
        "Categoría",
        "Tipo",
        "Sede",
        "Meta",
        "Recaudado",
        "Progreso %",
        "Estado",
      ],
    ],
    body: projects.map((p) => [
      p.name,
      p.category,
      translateProjectType(p.type),
      p.headquarter,
      formatCurrency(p.goal),
      formatCurrency(p.raised),
      `${p.progress}%`,
      translateProjectStatus(p.status),
    ]),
    startY: currentY + 2,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  const totalGoal = projects.reduce((sum, p) => sum + p.goal, 0);
  const totalRaised = projects.reduce((sum, p) => sum + p.raised, 0);
  const finalY = (doc as jsPDFWithAutoTable).lastAutoTable?.finalY || 35;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Meta: ${formatCurrency(totalGoal)}`, 14, finalY + 10);
  doc.text(`Total Recaudado: ${formatCurrency(totalRaised)}`, 14, finalY + 17);
  const overallProgress =
    totalGoal > 0 ? Math.round((totalRaised / totalGoal) * 100) : 0;
  doc.text(`Progreso General: ${overallProgress}%`, 14, finalY + 24);

  doc.save(`${fileName}_${Date.now()}.pdf`);
};

// Generar reporte de beneficiarios en PDF
export const generateBeneficiariesPDF = (
  beneficiaries: BeneficiaryReport[],
  fileName = "reporte_beneficiarios",
  metadata?: ReportMetadata,
) => {
  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Reporte de Beneficiarios", 14, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Fecha: ${formatDate(new Date().toISOString())}`, 14, 30);

  let currentY = 36;
  if (metadata?.generatedBy) {
    doc.text(`Generado por: ${metadata.generatedBy}`, 14, currentY);
    currentY += 6;
  }
  if (metadata?.headquartersName) {
    doc.text(`Sede: ${metadata.headquartersName}`, 14, currentY);
    currentY += 6;
  }

  autoTable(doc, {
    head: [
      [
        "Nombre completo",
        "Edad",
        "Categoría",
        "Sede",
        "Director de sede",
        "Teléfono",
        "Acudiente",
      ],
    ],
    body: beneficiaries.map((b) => [
      `${b.first_name} ${b.last_name}`,
      b.age || "N/A",
      b.category,
      b.headquarter_name || b.headquarters_id,
      b.headquarter_director || "N/A",
      b.phone,
      b.guardian || "N/A",
    ]),
    startY: currentY + 2,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  const finalY = (doc as jsPDFWithAutoTable).lastAutoTable?.finalY || 35;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Beneficiarios: ${beneficiaries.length}`, 14, finalY + 10);

  doc.save(`${fileName}_${Date.now()}.pdf`);
};

const formatEvaluationValue = (value: unknown): string => {
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

const evaluationTypeLabels: Record<EvaluationType, string> = {
  ANTHROPOMETRIC: "Antropométrica",
  TECHNICAL: "Técnico-Táctica",
  EMOTIONAL: "Emocional",
};

const formatEvaluationLabel = (value: string): string => {
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

const formatSection = (title: string, lines: string[]) => {
  if (lines.length === 0) return "";
  return [title, ...lines.map((line) => `  ${line}`)].join("\n");
};

const renderAnthropometricDetail = (
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

const renderTechnicalDetail = (detail: Record<string, unknown>): string => {
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

const renderEmotionalDetail = (detail: Record<string, unknown>): string => {
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

const formatEvaluationDetails = (
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

export const generateEvaluationsPDF = (
  evaluations: EvaluationReport[],
  fileName = "reporte_evaluaciones",
  metadata?: ReportMetadata,
) => {
  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Reporte de Evaluaciones", 14, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Fecha: ${formatDate(new Date().toISOString())}`, 14, 30);

  let currentY = 36;
  if (metadata?.generatedBy) {
    doc.text(`Generado por: ${metadata.generatedBy}`, 14, currentY);
    currentY += 6;
  }
  if (metadata?.headquartersName) {
    doc.text(`Sede: ${metadata.headquartersName}`, 14, currentY);
    currentY += 6;
  }

  const body = evaluations.map((evaluation) => [
    evaluation.beneficiaryName,
    evaluation.headquarterName || "N/A",
    formatDate(evaluation.date),
    evaluationTypeLabels[evaluation.type] || evaluation.type,
    formatEvaluationDetails(evaluation.questions, evaluation.type),
  ]);

  autoTable(doc, {
    head: [["Beneficiario", "Sede", "Fecha", "Tipo", "Preguntas y respuestas"]],
    body,
    startY: currentY + 2,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      4: { cellWidth: 90 },
    },
    didParseCell: (data) => {
      if (data.cell && data.section === "body" && data.column.index === 4) {
        data.cell.styles.cellPadding = 3;
      }
    },
  });

  const finalY = (doc as jsPDFWithAutoTable).lastAutoTable?.finalY || 35;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Evaluaciones: ${evaluations.length}`, 14, finalY + 10);

  doc.save(`${fileName}_${Date.now()}.pdf`);
};

// Generar reporte consolidado en Excel
export const generateConsolidatedExcel = (
  donations: DonationReport[],
  users: UserReport[],
  projects: ProjectReport[],
  fileName = "reporte_consolidado",
) => {
  const wb = XLSX.utils.book_new();

  // Sheet de Donaciones
  const donationsData = donations.map((d) => ({
    ID: d.id,
    Donante: d.donor,
    Monto: formatCurrency(d.amount),
    Proyecto: d.project,
    Fecha: formatDate(d.date),
    Estado: d.status,
  }));
  const wsDonations = XLSX.utils.json_to_sheet(donationsData);
  XLSX.utils.book_append_sheet(wb, wsDonations, "Donaciones");

  // Sheet de Usuarios
  const usersData = users.map((u) => ({
    ID: u.id,
    Nombre: u.name,
    Email: u.email,
    Rol: u.role,
    Estado: u.status,
    Fecha: formatDate(u.date),
  }));
  const wsUsers = XLSX.utils.json_to_sheet(usersData);
  XLSX.utils.book_append_sheet(wb, wsUsers, "Usuarios");

  // Sheet de Proyectos
  const projectsData = projects.map((p) => ({
    ID: p.id,
    Nombre: p.name,
    Categoría: p.category,
    Meta: formatCurrency(p.goal),
    Recaudado: formatCurrency(p.raised),
    Progreso: `${p.progress}%`,
    Estado: p.status,
  }));
  const wsProjects = XLSX.utils.json_to_sheet(projectsData);
  XLSX.utils.book_append_sheet(wb, wsProjects, "Proyectos");

  XLSX.writeFile(wb, `${fileName}_${Date.now()}.xlsx`);
};
