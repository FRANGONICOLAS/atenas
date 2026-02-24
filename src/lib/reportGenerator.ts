import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { 
  ProjectReport,
  BeneficiaryReport,
  UserReport
} from '@/types';

// Tipo extendido para jsPDF con autoTable
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

// Re-export tipos para compatibilidad
export type { 
  ProjectReport,
  BeneficiaryReport,
  UserReport
};

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
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Utilidad para formatear fecha
const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Generar reporte de donaciones en Excel
export const generateDonationsExcel = (donations: DonationReport[], fileName = 'reporte_donaciones') => {
  const data = donations.map(d => ({
    'ID': d.id,
    'Donante': d.donor,
    'Monto': formatCurrency(d.amount),
    'Proyecto': d.project,
    'Fecha': formatDate(d.date),
    'Estado': d.status,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  
  // Configurar ancho de columnas
  ws['!cols'] = [
    { wch: 8 },  // ID
    { wch: 25 }, // Donante
    { wch: 15 }, // Monto
    { wch: 30 }, // Proyecto
    { wch: 20 }, // Fecha
    { wch: 12 }, // Estado
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, 'Donaciones');
  XLSX.writeFile(wb, `${fileName}_${Date.now()}.xlsx`);
};

// Generar reporte de usuarios en Excel
export const generateUsersExcel = (users: UserReport[], fileName = 'reporte_usuarios') => {
  const data = users.map(u => ({
    'ID': u.id,
    'Nombre': u.name,
    'Email': u.email,
    'Rol': u.role,
    'Estado': u.status,
    'Fecha Registro': formatDate(u.date),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  
  ws['!cols'] = [
    { wch: 8 },  // ID
    { wch: 25 }, // Nombre
    { wch: 30 }, // Email
    { wch: 12 }, // Rol
    { wch: 12 }, // Estado
    { wch: 20 }, // Fecha
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
  XLSX.writeFile(wb, `${fileName}_${Date.now()}.xlsx`);
};

// Generar reporte de proyectos en Excel
export const generateProjectsExcel = (projects: ProjectReport[], fileName = 'reporte_proyectos') => {
  const data = projects.map(p => ({
    'ID': p.id,
    'Nombre': p.name,
    'Categoría': p.category,
    'Meta': formatCurrency(p.goal),
    'Recaudado': formatCurrency(p.raised),
    'Progreso': `${p.progress}%`,
    'Estado': p.status,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  
  ws['!cols'] = [
    { wch: 8 },  // ID
    { wch: 30 }, // Nombre
    { wch: 15 }, // Categoría
    { wch: 15 }, // Meta
    { wch: 15 }, // Recaudado
    { wch: 12 }, // Progreso
    { wch: 12 }, // Estado
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, 'Proyectos');
  XLSX.writeFile(wb, `${fileName}_${Date.now()}.xlsx`);
};

// Generar reporte de beneficiarios en Excel
export const generateBeneficiariesExcel = (beneficiaries: BeneficiaryReport[], fileName = 'reporte_beneficiarios') => {
  const data = beneficiaries.map(b => ({
    'ID': b.beneficiary_id,
    'Nombre': `${b.first_name} ${b.last_name}`,
    'Edad': b.age || 'N/A',
    'Categoría': b.category,
    'Sede': b.headquarters_id,
    'Teléfono': b.phone,
    'Estado': b.status || 'activo',
    'Rendimiento': b.performance ? `${b.performance}%` : 'N/A',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  
  ws['!cols'] = [
    { wch: 30 }, // ID
    { wch: 25 }, // Nombre
    { wch: 8 },  // Edad
    { wch: 15 }, // Categoría
    { wch: 30 }, // Sede
    { wch: 15 }, // Teléfono
    { wch: 12 }, // Estado
    { wch: 12 }, // Rendimiento
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, 'Beneficiarios');
  XLSX.writeFile(wb, `${fileName}_${Date.now()}.xlsx`);
};

/**
 * GENERACIÓN DE REPORTES EN PDF
 */

// Generar reporte de donaciones en PDF
export const generateDonationsPDF = (donations: DonationReport[], fileName = 'reporte_donaciones') => {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(18);
  doc.text('Reporte de Donaciones', 14, 22);
  
  // Fecha de generación
  doc.setFontSize(10);
  doc.text(`Generado: ${formatDate(new Date().toISOString())}`, 14, 30);
  
  // Tabla
  autoTable(doc, {
    head: [['ID', 'Donante', 'Monto', 'Proyecto', 'Fecha', 'Estado']],
    body: donations.map(d => [
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
  doc.setFont('helvetica', 'bold');
  doc.text(`Total: ${formatCurrency(total)}`, 14, finalY + 10);
  
  doc.save(`${fileName}_${Date.now()}.pdf`);
};

// Generar reporte de usuarios en PDF
export const generateUsersPDF = (users: UserReport[], fileName = 'reporte_usuarios') => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Reporte de Usuarios', 14, 22);
  
  doc.setFontSize(10);
  doc.text(`Generado: ${formatDate(new Date().toISOString())}`, 14, 30);
  
  autoTable(doc, {
    head: [['ID', 'Nombre', 'Email', 'Rol', 'Estado', 'Fecha Registro']],
    body: users.map(u => [
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
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Usuarios: ${users.length}`, 14, finalY + 10);
  
  doc.save(`${fileName}_${Date.now()}.pdf`);
};

// Generar reporte de proyectos en PDF
export const generateProjectsPDF = (projects: ProjectReport[], fileName = 'reporte_proyectos') => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Reporte de Proyectos', 14, 22);
  
  doc.setFontSize(10);
  doc.text(`Generado: ${formatDate(new Date().toISOString())}`, 14, 30);
  
  autoTable(doc, {
    head: [['ID', 'Nombre', 'Categoría', 'Meta', 'Recaudado', 'Progreso', 'Estado']],
    body: projects.map(p => [
      p.id,
      p.name,
      p.category,
      formatCurrency(p.goal),
      formatCurrency(p.raised),
      `${p.progress}%`,
      p.status,
    ]),
    startY: 35,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });
  
  const totalGoal = projects.reduce((sum, p) => sum + p.goal, 0);
  const totalRaised = projects.reduce((sum, p) => sum + p.raised, 0);
  const finalY = (doc as jsPDFWithAutoTable).lastAutoTable?.finalY || 35;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Meta: ${formatCurrency(totalGoal)}`, 14, finalY + 10);
  doc.text(`Total Recaudado: ${formatCurrency(totalRaised)}`, 14, finalY + 17);
  doc.text(`Progreso General: ${Math.round((totalRaised / totalGoal) * 100)}%`, 14, finalY + 24);
  
  doc.save(`${fileName}_${Date.now()}.pdf`);
};

// Generar reporte de beneficiarios en PDF
export const generateBeneficiariesPDF = (beneficiaries: BeneficiaryReport[], fileName = 'reporte_beneficiarios') => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Reporte de Beneficiarios', 14, 22);
  
  doc.setFontSize(10);
  doc.text(`Generado: ${formatDate(new Date().toISOString())}`, 14, 30);
  
  autoTable(doc, {
    head: [['Nombre', 'Edad', 'Categoría', 'Estado', 'Rendimiento']],
    body: beneficiaries.map(b => [
      `${b.first_name} ${b.last_name}`,
      b.age || 'N/A',
      b.category,
      b.status || 'activo',
      b.performance ? `${b.performance}%` : 'N/A',
    ]),
    startY: 35,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });
  
  const finalY = (doc as jsPDFWithAutoTable).lastAutoTable?.finalY || 35;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Beneficiarios: ${beneficiaries.length}`, 14, finalY + 10);
  
  doc.save(`${fileName}_${Date.now()}.pdf`);
};

// Generar reporte consolidado en Excel
export const generateConsolidatedExcel = (
  donations: DonationReport[],
  users: UserReport[],
  projects: ProjectReport[],
  fileName = 'reporte_consolidado'
) => {
  const wb = XLSX.utils.book_new();
  
  // Sheet de Donaciones
  const donationsData = donations.map(d => ({
    'ID': d.id,
    'Donante': d.donor,
    'Monto': formatCurrency(d.amount),
    'Proyecto': d.project,
    'Fecha': formatDate(d.date),
    'Estado': d.status,
  }));
  const wsDonations = XLSX.utils.json_to_sheet(donationsData);
  XLSX.utils.book_append_sheet(wb, wsDonations, 'Donaciones');
  
  // Sheet de Usuarios
  const usersData = users.map(u => ({
    'ID': u.id,
    'Nombre': u.name,
    'Email': u.email,
    'Rol': u.role,
    'Estado': u.status,
    'Fecha': formatDate(u.date),
  }));
  const wsUsers = XLSX.utils.json_to_sheet(usersData);
  XLSX.utils.book_append_sheet(wb, wsUsers, 'Usuarios');
  
  // Sheet de Proyectos
  const projectsData = projects.map(p => ({
    'ID': p.id,
    'Nombre': p.name,
    'Categoría': p.category,
    'Meta': formatCurrency(p.goal),
    'Recaudado': formatCurrency(p.raised),
    'Progreso': `${p.progress}%`,
    'Estado': p.status,
  }));
  const wsProjects = XLSX.utils.json_to_sheet(projectsData);
  XLSX.utils.book_append_sheet(wb, wsProjects, 'Proyectos');
  
  XLSX.writeFile(wb, `${fileName}_${Date.now()}.xlsx`);
};

