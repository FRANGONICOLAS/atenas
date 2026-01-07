import { Mail, Lock, User, Phone } from 'lucide-react';
import { type FieldConfig, type StepConfig } from '@/types/form.types';

// Login Form Fields
export const LOGIN_FORM_FIELDS: Record<string, FieldConfig> = {
  email: {
    label: 'Correo electrónico',
    type: 'email',
    placeholder: 'correo@ejemplo.com',
    icon: Mail,
  },
  password: {
    label: 'Contraseña',
    type: 'password',
    placeholder: '••••••••',
    icon: Lock,
  },
};

// Register Form Steps
export const REGISTER_FORM_STEPS: StepConfig[] = [
  {
    title: 'Datos Personales',
    description: 'Información básica sobre ti',
    fields: {
      first_name: {
        label: 'Nombre',
        type: 'text',
        placeholder: 'Tu nombre',
        icon: User,
      },
      last_name: {
        label: 'Apellido',
        type: 'text',
        placeholder: 'Tu apellido',
        icon: User,
      },
      birthdate: {
        label: 'Fecha de Nacimiento',
        type: 'date',
        placeholder: 'Selecciona tu fecha de nacimiento',
      },
    },
  },
  {
    title: 'Datos de Cuenta',
    description: 'Información de tu cuenta',
    fields: {
      username: {
        label: 'Username',
        type: 'text',
        placeholder: 'username123',
        icon: User,
      },
      email: {
        label: 'Correo electrónico',
        type: 'email',
        placeholder: 'correo@ejemplo.com',
        icon: Mail,
      },
      phone: {
        label: 'Teléfono',
        type: 'tel',
        placeholder: '+57 300 123 4567',
        icon: Phone,
        optional: true,
      },
    },
  },
  {
    title: 'Contraseña',
    description: 'Protege tu cuenta',
    fields: {
      password: {
        label: 'Contraseña',
        type: 'password',
        placeholder: '••••••••',
        icon: Lock,
        helpText: 'Mínimo 8 caracteres, una mayúscula y un número',
      },
      confirmPassword: {
        label: 'Confirmar contraseña',
        type: 'password',
        placeholder: '••••••••',
        icon: Lock,
      },
    },
  },
];

// Complete Profile Form Fields
export const COMPLETE_PROFILE_FIELDS: Record<string, FieldConfig> = {
  first_name: {
    label: 'Nombre',
    type: 'text',
    placeholder: 'Tu nombre',
    icon: User,
  },
  last_name: {
    label: 'Apellido',
    type: 'text',
    placeholder: 'Tu apellido',
    icon: User,
  },
  username: {
    label: 'Username',
    type: 'text',
    placeholder: 'username123',
    icon: User,
  },
  birthdate: {
    label: 'Fecha de Nacimiento',
    type: 'date',
    placeholder: 'Selecciona tu fecha de nacimiento',
  },
  phone: {
    label: 'Teléfono',
    type: 'tel',
    placeholder: '+57 300 123 4567',
    icon: Phone,
    optional: true,
  },
};
