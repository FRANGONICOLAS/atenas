import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { GenericAuthForm } from '@/components/forms';
import { toast } from 'sonner';
import { authService } from '@/api/services/auth.service';
import { userService } from '@/api/services/user.service';
import { handleAuthError } from '@/lib/errorHandler';
import { createUserSchema, type CreateUserInput } from '@/lib/schemas/user.schema';
import { useLanguage } from '@/contexts/LanguageContext';
import { REGISTER_FORM_STEPS } from '@/config/authFormFields';

const RegisterPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: 'donator',
      phone: '',
    },
  });

  const onSubmit = async (data: CreateUserInput) => {
    setIsLoading(true);
    try {
      // 1. Crear usuario en Supabase Auth
      const { user: authUser } = await authService.signUp(
        data.email,
        data.password,
        {
          first_name: data.first_name,
          last_name: data.last_name,
          username: data.username,
        }
      );

      if (!authUser || !authUser.id) {
        throw new Error('No se pudo crear el usuario');
      }

      // 2. Crear usuario en tabla user propia
      await userService.create({
        id: authUser.id,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        birthdate: data.birthdate,
        username: data.username,
        phone: data.phone || '',
        // Rol fijo por autoservicio
        role: 'donator',
      });

      toast.success('¡Cuenta creada exitosamente!');
      
      // Verificar si requiere confirmación de email
      if (authUser.confirmation_sent_at) {
        toast.info('Por favor verifica tu email para activar tu cuenta');
      }
      
      navigate('/login');
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <GenericAuthForm
        title={t.auth.register}
        steps={REGISTER_FORM_STEPS}
        form={form}
        onSubmit={onSubmit}
        isLoading={isLoading}
        submitButtonText={isLoading ? 'Creando cuenta...' : t.auth.register}
        footerText={t.auth.hasAccount}
        footerLinkText={t.auth.login}
        footerLinkHref="/login"
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
      />
    </AuthLayout>
  );
};

export default RegisterPage;
