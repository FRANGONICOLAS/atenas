import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { GenericAuthForm } from '@/components/forms';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { authService } from '@/api/services/auth.service';
import { handleAuthError } from '@/lib/errorHandler';
import { loginSchema, type LoginInput } from '@/lib/schemas/user.schema';
import { LOGIN_FORM_FIELDS } from '@/config/authFormFields';

const LoginPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      await authService.signIn(data.email, data.password);
      toast.success('¡Bienvenido de nuevo!');
      navigate('/');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await authService.signInWithProvider();
      // La redirección es manejada por Supabase
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      handleAuthError(error);
      setIsGoogleLoading(false);
    }
  };

  return (
    <AuthLayout>
      <GenericAuthForm
        title={t.auth.login}
        fields={LOGIN_FORM_FIELDS}
        form={form}
        onSubmit={onSubmit}
        onGoogleLogin={handleGoogleLogin}
        isLoading={isLoading}
        isGoogleLoading={isGoogleLoading}
        showForgotPassword
        showGoogleLogin
        showRememberMe
        submitButtonText={isLoading ? 'Ingresando...' : t.auth.login}
        footerText={t.auth.noAccount}
        footerLinkText={t.auth.register}
        footerLinkHref="/registro"
      />
    </AuthLayout>
  );
};

export default LoginPage;
