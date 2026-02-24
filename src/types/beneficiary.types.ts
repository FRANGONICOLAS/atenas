// Categorías de beneficiarios
export type BeneficiaryCategory =
  | "Categoría 1"
  | "Categoría 2"
  | "Categoría 3"
  | "Categoría 4"
  | "Categoría 5";

// Estados de beneficiarios
export type BeneficiaryStatus =
  | "activo"
  | "inactivo"
  | "pendiente"
  | "suspendido";

// Interfaz para datos antropométricos
export interface AntropometricData {
  genero?: "hombre" | "mujer";
  
  // Medidas Antropométricas
  peso?: number;
  talla?: number;
  imc?: number;
  perimetro_cintura?: number;
  perimetro_cadera?: number;
  relacion_cintura_cadera?: number;
  perimetro_brazo?: number;
  perimetro_muslo?: number;
  perimetro_pantorrilla?: number;
  
  // Pliegues Cutáneos
  pliegue_tricipital?: number;
  pliegue_bicipital?: number;
  pliegue_subescapular?: number;
  pliegue_suprailiaco?: number;
  pliegue_abdominal?: number;
  pliegue_muslo?: number;
  pliegue_pantorrilla?: number;
  
  // Diámetros Óseos
  biacromial?: number;
  bicrestal?: number;
  biepicondilar_humero?: number;
  biepicondilar_femur?: number;
  biestiloideo_muneca?: number;
  bitrocantereo?: number;
  
  // Composición Corporal
  porcentaje_grasa?: number;
  masa_magra?: number;
  masa_osea?: number;
  
  // Somatotipo
  endomorfina?: number;
  mesomorfina?: number;
  ectomorfina?: number;
  
  [key: string]: unknown;
}

// Interfaz para datos técnico-tácticos
export interface TechnicalTacticalData {
  pase?: number;
  recepcion?: number;
  remate?: number;
  regate?: number;
  ubicacion_espacio_temporal?: number;
  observaciones?: string;
  [key: string]: unknown;
}

// Interfaz para datos emocionales
export interface EmotionalData {
  triste_desanimado?: string;
  dificultad_concentracion?: string;
  estres_ansiedad?: string;
  problemas_sueno?: string;
  poca_energia?: string;
  apoyo_social?: string;
  observaciones?: string;
  [key: string]: unknown;
}

// Detalle de evaluacion vinculada al beneficiario
export interface BeneficiaryEvaluationDetail {
  id: string;
  created_at?: string | null;
  anthropometric_detail?: AntropometricData | null;
  technical_tactic_detail?: TechnicalTacticalData | null;
  emotional_detail?: EmotionalData | null;
}

// Interfaz principal de beneficiario basada en la estructura de la base de datos
export interface Beneficiary {
  idx?: number;
  beneficiary_id: string;
  headquarters_id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  category: BeneficiaryCategory | string;
  phone: string;
  registry_date: string;
  status?: BeneficiaryStatus | string;
  sex?: string; // Género (hombre/mujer)
  performance?: number; // Rendimiento (%) - Calculado automáticamente del promedio técnico
  guardian?: string; // Acudiente
  address?: string; // Dirección
  emergency_contact?: string; // Contacto de emergencia
  medical_info?: string; // Información médica
  photo_url?: string | null; // Foto de perfil
  observation?: string; // Observaciones generales
  anthropometric_detail?: AntropometricData; // Ultima evaluacion antropometrica
  technical_tactic_detail?: TechnicalTacticalData; // Ultima evaluacion tecnico-tactica
  emotional_detail?: EmotionalData; // Ultima evaluacion emocional
  latest_evaluation?: BeneficiaryEvaluationDetail; // Ultima evaluacion completa
  created_at?: string;
  updated_at?: string;
}

// Datos para crear un beneficiario
export interface CreateBeneficiaryData {
  headquarters_id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  category: BeneficiaryCategory | string;
  phone: string;
  registry_date?: string;
  status?: BeneficiaryStatus | string;
  sex?: string;
  performance?: number;
  guardian?: string;
  photo_url?: string | null;
  address?: string;
  emergency_contact?: string;
  medical_info?: string;
  observation?: string;
  anthropometric_detail?: AntropometricData;
  technical_tactic_detail?: TechnicalTacticalData;
  emotional_detail?: EmotionalData;
}

// Datos para actualizar un beneficiario
export interface UpdateBeneficiaryData {
  headquarters_id?: string;
  first_name?: string;
  last_name?: string;
  birth_date?: string;
  category?: BeneficiaryCategory | string;
  phone?: string;
  registry_date?: string;
  status?: BeneficiaryStatus | string;
  sex?: string;
  performance?: number;
  guardian?: string;
  photo_url?: string | null;
  address?: string;
  emergency_contact?: string;
  medical_info?: string;
  observation?: string;
  anthropometric_detail?: AntropometricData;
  technical_tactic_detail?: TechnicalTacticalData;
  emotional_detail?: EmotionalData;
}

// Interfaz para reportes (mantiene compatibilidad con código existente)
export interface BeneficiaryReport {
  beneficiary_id: string;
  first_name: string;
  last_name: string;
  age?: number;
  category: string;
  headquarters_id: string;
  phone: string;
  registry_date: string;
  status?: string;
  performance?: number;
}

// Interfaz para estadísticas por sede
export interface SedeStats {
  name: string;
  total: number;
  active: number;
  avgPerf: number;
}

// Interfaz para vista pública de beneficiarios (con edad calculada)
export interface BeneficiaryPublic {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  category: string;
  performance: number;
  photoUrl: string | null;
  status?: string;
  registryDate: string;
}
