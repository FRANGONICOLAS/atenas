import { useState } from 'react';
import { Link } from 'react-router-dom';
import { type FieldValues, type Path, type FieldError } from 'react-hook-form';
import { Heart, Eye, EyeOff, ChevronRight, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type GenericFormProps, type FieldConfig, type CurrentFieldsConfig } from '@/types/form.types';

export function GenericAuthForm<T extends FieldValues>({
  title,
  description,
  fields,
  steps,
  form,
  onSubmit,
  onGoogleLogin,
  isLoading = false,
  isGoogleLoading = false,
  showForgotPassword = false,
  showGoogleLogin = false,
  showRememberMe = false,
  submitButtonText,
  footerText,
  footerLinkText,
  footerLinkHref,
  currentStep: externalCurrentStep,
  setCurrentStep: externalSetCurrentStep,
}: GenericFormProps<T>) {
  const [internalCurrentStep, setInternalCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  // Usar estado externo si está disponible, sino usar interno
  const currentStep = externalCurrentStep ?? internalCurrentStep;
  const setCurrentStep = externalSetCurrentStep ?? setInternalCurrentStep;

  const isMultiStep = !!steps;
  const totalSteps = steps ? steps.length : 1;

  // Obtener la configuración actual
  const currentConfig: CurrentFieldsConfig = isMultiStep && steps
    ? steps[currentStep - 1]
    : { fields: fields || {}, title: '', description: '' };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = form;

  const handleNext = async () => {
    if (!isMultiStep || !steps) return;

    // Validar campos del paso actual
    const fieldsToValidate = Object.keys(currentConfig.fields) as Path<T>[];
    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setCurrentStep(Math.min(currentStep + 1, totalSteps));
    }
  };

  const handlePrev = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  const handleFormSubmit = async (data: T) => {
    if (isMultiStep && currentStep < totalSteps) {
      await handleNext();
    } else {
      await onSubmit(data);
    }
  };

  const renderField = (fieldName: string, config: FieldConfig) => {
    const Icon = config.icon;
    const fieldPath = fieldName as Path<T>;
    const error = errors[fieldName] as FieldError | undefined;

    return (
      <div key={fieldName}>
        <Label htmlFor={fieldName}>
          {config.label}
          {config.optional && (
            <span className="text-muted-foreground text-xs ml-1">(opcional)</span>
          )}
        </Label>

        {config.type === 'date' ? (
          <div className="mt-2">
            <DatePicker
              date={
                watch(fieldPath)
                  ? new Date(String(watch(fieldPath)) + 'T12:00:00')
                  : undefined
              }
              onDateChange={(date) => {
                if (date) {
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  setValue(fieldPath, `${year}-${month}-${day}` as T[Path<T>]);
                } else {
                  setValue(fieldPath, '' as T[Path<T>]);
                }
              }}
              placeholder={config.placeholder || 'Selecciona una fecha'}
            />
          </div>
        ) : config.type === 'select' ? (
          <div className="mt-2">
            <Select
              value={String(watch(fieldPath) || '')}
              onValueChange={(value) => setValue(fieldPath, value as T[Path<T>])}
            >
              <SelectTrigger id={fieldName}>
                <SelectValue placeholder={config.placeholder || 'Selecciona una opción'} />
              </SelectTrigger>
              <SelectContent>
                {config.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="relative mt-2">
            {Icon && (
              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            )}
            <Input
              id={fieldName}
              type={
                config.type === 'password'
                  ? showPassword
                    ? 'text'
                    : 'password'
                  : config.type
              }
              placeholder={config.placeholder || ''}
              className={Icon ? 'pl-10' : ''}
              {...register(fieldPath)}
            />
            {config.type === 'password' && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive mt-1">
            {error.message}
          </p>
        )}
        {config.helpText && !error && (
          <p className="text-xs text-muted-foreground mt-1">{config.helpText}</p>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        )}

        {/* Progress indicator para multi-step */}
        {isMultiStep && totalSteps > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
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
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Título del paso actual */}
          {isMultiStep && currentConfig.title && (
            <div className="text-center mb-4">
              <h3 className="font-semibold">{currentConfig.title}</h3>
              <p className="text-sm text-muted-foreground">
                Paso {currentStep} de {totalSteps}
              </p>
            </div>
          )}

          {/* Renderizar campos del paso actual */}
          {Object.entries(currentConfig.fields).map(([fieldName, fieldConfig]) =>
            renderField(fieldName, fieldConfig as FieldConfig)
          )}

          {/* Remember me checkbox - solo en login */}
          {showRememberMe && !isMultiStep && (
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-input"
                  {...register('rememberMe' as Path<T>)}
                />
                <span>Recordarme</span>
              </label>
            </div>
          )}

          {/* Forgot password link - solo en login */}
          {showForgotPassword && !isMultiStep && (
            <div className="text-right">
              <Link
                to="/reset-password"
                className="text-sm text-primary hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          )}

          {/* Botones de navegación */}
          {isMultiStep ? (
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrev}
                  className="flex-1"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
              )}

              {currentStep < totalSteps ? (
                <Button type="button" onClick={handleNext} className="flex-1">
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading
                    ? 'Procesando...'
                    : submitButtonText || 'Finalizar'}
                </Button>
              )}
            </div>
          ) : (
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading
                ? 'Procesando...'
                : submitButtonText || 'Enviar'}
            </Button>
          )}

          {/* Google login - solo en login */}
          {showGoogleLogin && !isMultiStep && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    O continúa con
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                size="lg"
                onClick={onGoogleLogin}
                disabled={isGoogleLoading}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {isGoogleLoading ? 'Conectando...' : 'Continuar con Google'}
              </Button>
            </>
          )}
        </form>

        {/* Footer con link */}
        {footerText && footerLinkText && footerLinkHref && (
          <div className="mt-6 text-center">
            <span className="text-muted-foreground">{footerText} </span>
            <Link
              to={footerLinkHref}
              className="text-primary hover:underline font-medium"
            >
              {footerLinkText}
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
