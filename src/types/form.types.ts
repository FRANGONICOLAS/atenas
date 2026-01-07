import { type LucideIcon } from 'lucide-react';
import { type UseFormReturn, type FieldValues, type Path, type PathValue } from 'react-hook-form';

// Tipos de campos soportados
export type FieldType = 'text' | 'email' | 'password' | 'tel' | 'date' | 'select';

// Configuración de un campo individual
export interface FieldConfig {
  label: string;
  placeholder?: string;
  type: FieldType;
  icon?: LucideIcon;
  optional?: boolean;
  options?: { value: string; label: string }[]; 
  helpText?: string; 
}

// Configuración de un paso en formularios multi-paso
export interface StepConfig {
  title: string;
  description?: string;
  fields: Record<string, FieldConfig>;
}

// Configuración actual de campos (un solo paso o paso actual en multi-paso)
export interface CurrentFieldsConfig {
  fields: Record<string, FieldConfig>;
  title?: string;
  description?: string;
}

// Props del formulario genérico
export interface GenericFormProps<T extends FieldValues> {
  // Información del formulario
  title: string;
  description?: string;

  // Configuración de campos
  fields?: Record<string, FieldConfig>;
  steps?: StepConfig[];

  // Métodos de react-hook-form
  form: UseFormReturn<T>;

  // Handlers
  onSubmit: (data: T) => void | Promise<void>;
  onGoogleLogin?: () => void | Promise<void>;

  // Estado
  isLoading?: boolean;
  isGoogleLoading?: boolean;

  // Personalización
  showForgotPassword?: boolean;
  showGoogleLogin?: boolean;
  showRememberMe?: boolean;
  submitButtonText?: string;
  footerText?: string;
  footerLinkText?: string;
  footerLinkHref?: string;

  // Control de pasos (para formularios multi-paso)
  currentStep?: number;
  setCurrentStep?: (step: number) => void;
}

// Helper type para extraer el tipo de un campo del formulario
export type FormFieldValue<T extends FieldValues, K extends Path<T>> = PathValue<T, K>;
