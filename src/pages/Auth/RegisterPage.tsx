import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Heart, Mail, Lock, Eye, EyeOff, User, Phone, ChevronRight, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { toast } from 'sonner';
import { authService } from '@/api/services/auth.service';
import { userService } from '@/api/services/user.service';
import { handleAuthError } from '@/lib/errorHandler';
import { createUserSchema, type CreateUserInput } from '@/lib/schemas/user.schema';
import { useLanguage } from '@/contexts/LanguageContext';

const RegisterPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: 'donator',
      phone: '',
    },
  });

  const nextStep = async () => {
    let fieldsToValidate: (keyof CreateUserInput)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = ['first_name', 'last_name', 'birthdate'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['username', 'email', 'phone'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

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
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">{t.auth.register}</CardTitle>
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-2 w-12 rounded-full transition-colors ${
                  step === currentStep
                    ? 'bg-primary'
                    : step < currentStep
                    ? 'bg-primary/50'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Paso 1: Datos Personales */}
            {currentStep === 1 && (
              <>
                <div className="text-center mb-4">
                  <h3 className="font-semibold">Datos Personales</h3>
                  <p className="text-sm text-muted-foreground">Paso 1 de 3</p>
                </div>

                <div>
                  <Label htmlFor="first_name">Nombre</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="first_name"
                      placeholder="Tu nombre"
                      className="pl-10"
                      {...register('first_name')}
                    />
                  </div>
                  {errors.first_name && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.first_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="last_name">Apellido</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="last_name"
                      placeholder="Tu apellido"
                      className="pl-10"
                      {...register('last_name')}
                    />
                  </div>
                  {errors.last_name && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.last_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="birthdate">Fecha de Nacimiento</Label>
                  <div className="mt-2">
                    <DatePicker
                      date={watch('birthdate') ? new Date(watch('birthdate') + 'T12:00:00') : undefined}
                      onDateChange={(date) => {
                        if (date) {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          setValue('birthdate', `${year}-${month}-${day}`);
                        } else {
                          setValue('birthdate', '');
                        }
                      }}
                      placeholder="Selecciona tu fecha de nacimiento"
                    />
                  </div>
                  {errors.birthdate && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.birthdate.message}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Paso 2: Datos de Cuenta */}
            {currentStep === 2 && (
              <>
                <div className="text-center mb-4">
                  <h3 className="font-semibold">Datos de Cuenta</h3>
                  <p className="text-sm text-muted-foreground">Paso 2 de 3</p>
                </div>

                <div>
                  <Label htmlFor="username">Username</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="username"
                      placeholder="username123"
                      className="pl-10"
                      {...register('username')}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">{t.auth.email}</Label>
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

                <div>
                  <Label htmlFor="phone">Teléfono (opcional)</Label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+57 300 123 4567"
                      className="pl-10"
                      {...register('phone')}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

              </>
            )}

            {/* Paso 3: Contraseña */}
            {currentStep === 3 && (
              <>
                <div className="text-center mb-4">
                  <h3 className="font-semibold">Contraseña</h3>
                  <p className="text-sm text-muted-foreground">Paso 3 de 3</p>
                </div>

                <div>
                  <Label htmlFor="password">{t.auth.password}</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.password.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Mínimo 8 caracteres, una mayúscula y un número
                  </p>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">{t.auth.confirmPassword}</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10"
                      {...register('confirmPassword')}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Botones de navegación */}
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
              )}
              
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creando cuenta...' : t.auth.register}
                </Button>
              )}
            </div>
          </form>

          <div className="mt-6 text-center">
            <span className="text-muted-foreground">{t.auth.hasAccount} </span>
            <Link to="/login" className="text-primary hover:underline font-medium">
              {t.auth.login}
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default RegisterPage;
