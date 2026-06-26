import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type {
  DonationReport,
  UserReport,
  ProjectReport,
  BeneficiaryReport,
  EvaluationReport,
  ReportMetadata,
} from "./types";
import {
  formatCurrency,
  formatDate,
  translateProjectType,
  translateProjectStatus,
  evaluationTypeLabels,
  formatEvaluationDetails,
  jsPDFWithAutoTable,
} from "./types";

export const generateDonationsPDF = (
  donations: DonationReport[],
  fileName = "reporte_donaciones",
) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Reporte de Donaciones", 14, 22);

  doc.setFontSize(10);
  doc.text(`Generado: ${formatDate(new Date().toISOString())}`, 14, 30);

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

  const total = donations.reduce((sum, d) => sum + d.amount, 0);
  const finalY = (doc as jsPDFWithAutoTable).lastAutoTable?.finalY || 35;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Total: ${formatCurrency(total)}`, 14, finalY + 10);

  doc.save(`${fileName}_${Date.now()}.pdf`);
};

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
