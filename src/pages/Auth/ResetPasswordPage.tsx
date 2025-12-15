import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Heart, Mail, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { toast } from 'sonner';
import { authService } from '@/api/services/auth.service';
import { handleAuthError } from '@/lib/errorHandler';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/schemas/user.schema';

const ResetPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true);
    try {
      await authService.resetPasswordForEmail(data.email);
      setEmailSent(true);
      toast.success('Email de recuperación enviado');
    } catch (error) {
      console.error('Error al enviar email de recuperación:', error);
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Recuperar Contraseña</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña
          </p>
        </CardHeader>
        <CardContent>
          {emailSent ? (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Hemos enviado un email de recuperación a tu correo. Por favor revisa tu bandeja de entrada
                  y sigue las instrucciones para restablecer tu contraseña.
                </AlertDescription>
              </Alert>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    className="pl-10"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar Email de Recuperación'}
              </Button>

              <Link to="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Login
                </Button>
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
