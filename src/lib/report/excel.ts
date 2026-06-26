import * as XLSX from "xlsx";
import type {
  DonationReport,
  ProjectReport,
  BeneficiaryReport,
  UserReport,
  ReportMetadata,
} from "./types";
import { formatCurrency, formatDate, translateProjectType, translateProjectStatus } from "./types";

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

  ws["!cols"] = [
    { wch: 8 },
    { wch: 25 },
    { wch: 15 },
    { wch: 30 },
    { wch: 20 },
    { wch: 12 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Donaciones");
  XLSX.writeFile(wb, `${fileName}_${Date.now()}.xlsx`);
};

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
    { wch: 8 },
    { wch: 25 },
    { wch: 30 },
    { wch: 12 },
    { wch: 12 },
    { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Usuarios");
  XLSX.writeFile(wb, `${fileName}_${Date.now()}.xlsx`);
};

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
    { wch: 30 },
    { wch: 15 },
    { wch: 12 },
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Proyectos");
  XLSX.writeFile(wb, `${fileName}_${Date.now()}.xlsx`);
};

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
    { wch: 30 },
    { wch: 8 },
    { wch: 15 },
    { wch: 25 },
    { wch: 25 },
    { wch: 15 },
    { wch: 25 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Beneficiarios");
  XLSX.writeFile(wb, `${fileName}_${Date.now()}.xlsx`);
};

export const generateConsolidatedExcel = (
  donations: DonationReport[],
  users: UserReport[],
  projects: ProjectReport[],
  fileName = "reporte_consolidado",
) => {
  const wb = XLSX.utils.book_new();

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
