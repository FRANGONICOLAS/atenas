import type { TechnicalTacticalData, AntropometricData } from '@/types/beneficiary.types';
import type { EvaluationRow } from '@/api/types';

export const calculatePerformance = (technicalData?: TechnicalTacticalData | null): number => {
  if (!technicalData) return 0;

  const skills = [
    technicalData.pase,
    technicalData.recepcion,
    technicalData.remate,
    technicalData.regate,
    technicalData.ubicacion_espacio_temporal
  ].filter(v => v !== undefined && v !== null && typeof v === 'number') as number[];

  if (skills.length === 0) return 0;

  const avg = skills.reduce((sum, val) => sum + val, 0) / skills.length;
  
  // Convertir de escala 1-5 a 0-100: ((avg - 1) / 4) * 100
  const performance = Math.round(((avg - 1) / 4) * 100);
  
  return Math.max(0, Math.min(100, performance)); // Asegurar que esté entre 0-100
};

/**
 * Extrae el género desde los datos antropométricos
 * @param antropometricData - Datos antropométricos del beneficiario
 * @returns "hombre", "mujer", o undefined
 */
export const extractSex = (antropometricData?: AntropometricData | null): string | undefined => {
  return antropometricData?.genero;
};

/**
 * Calcula el IMC (Índice de Masa Corporal)
 * @param peso - Peso en kilogramos
 * @param talla - Talla en centímetros
 * @returns IMC calculado o undefined si faltan datos
 */
export const calculateIMC = (peso?: number, talla?: number): number | undefined => {
  if (!peso || !talla || talla === 0) return undefined;
  
  const imc = peso / Math.pow(talla / 100, 2);
  return parseFloat(imc.toFixed(2));
};

/**
 * Calcula la relación cintura-cadera
 * @param cintura - Perímetro de cintura en cm
 * @param cadera - Perímetro de cadera en cm
 * @returns Relación cintura-cadera o undefined si faltan datos
 */
export const calculateWaistHipRatio = (cintura?: number, cadera?: number): number | undefined => {
  if (!cintura || !cadera || cadera === 0) return undefined;
  
  const ratio = cintura / cadera;
  return parseFloat(ratio.toFixed(2));
};

/**
 * Obtiene el promedio técnico-táctico en escala 1-5
 * @param technicalData - Datos técnico-tácticos del beneficiario
 * @returns Promedio de habilidades (1-5) o 0 si no hay datos
 */
export const getTechnicalAverage = (technicalData?: TechnicalTacticalData | null): number => {
  if (!technicalData) return 0;

  const skills = [
    technicalData.pase,
    technicalData.recepcion,
    technicalData.remate,
    technicalData.regate,
    technicalData.ubicacion_espacio_temporal
  ].filter(v => v !== undefined && v !== null && typeof v === 'number') as number[];

  if (skills.length === 0) return 0;

  const avg = skills.reduce((sum, val) => sum + val, 0) / skills.length;
  return parseFloat(avg.toFixed(1));
};

/**
 * Calcula una métrica numérica para una evaluación completa dependiendo de su tipo.
 *
 * - técnico‑táctica: utiliza el performance convertido a 0‑100 (calculatePerformance).
 * - antropométrica: retorna IMC si está disponible o lo calcula a partir de peso/talla.
 * - psicológica/emocional: por ahora no hay valor numérico asociado, devuelve 0.
 */
export const getEvaluationScore = (evaluation: EvaluationRow): number => {
  switch (evaluation.type) {
    case 'technical_tactic':
      return calculatePerformance(evaluation.questions_answers as TechnicalTacticalData | null);
    case 'anthropometric': {
      const data = evaluation.questions_answers as AntropometricData | null;
      if (!data) return 0;
      if (typeof data.imc === 'number') {
        return data.imc;
      }
      return calculateIMC(data.peso, data.talla) ?? 0;
    }
    case 'psychological_emotional':
      return 0;
    default:
      return 0;
  }
};
