import { useState, useEffect } from 'react';
import { Heart, Check, ArrowLeft, Shield, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link, useSearchParams } from 'react-router-dom';
import { useBoldCheckout } from '@/hooks/useBoldCheckout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';

const DonationPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { projects, projectsLoading } = useProjects();
  
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [destination, setDestination] = useState<'free' | 'project'>('free');
  const [selectedProject, setSelectedProject] = useState('');
  const [description, setDescription] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState('');

  // Obtener project_id de URL si viene desde un proyecto específico
  const projectIdFromUrl = searchParams.get('project_id');
  
  const amounts = [50000, 100000, 200000, 500000];

  useEffect(() => {
    if (projectIdFromUrl) {
      setDestination('project');
      setSelectedProject(projectIdFromUrl);
    } else {
      setDestination('free');
    }
  }, [projectIdFromUrl]);

  const finalAmount = amount || parseInt(customAmount) || 0;

  // Inicializar Bold Checkout
  const { openCheckout, isLoading, error } = useBoldCheckout({
    amount: finalAmount,
    currency: 'COP',
    description: description || `Donación ${destination === 'free' ? 'Libre Inversión' : `para ${projects.find(p => p.project_id === selectedProject)?.name || 'UAO'}`}`,
    projectId: selectedProject,
    onSuccess: (orderId) => {
      setCompletedOrderId(orderId);
      setIsComplete(true);
    },
    onError: (err) => {
      console.error('Error en checkout Bold:', err);
    }
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handlePayment = async () => {
    if (!user) {
      // Redirigir a login si no está autenticado
      window.location.href = '/auth/login?redirect=/donation';
      return;
    }
    
    await openCheckout();
  };

  if (isComplete) {
    return (
      <div className="min-h-screen pt-20 bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              ¡Transacción Iniciada!
            </h2>
            <p className="text-muted-foreground mb-4">
              Tu donación de {formatCurrency(finalAmount)} está siendo procesada.
            </p>
            <div className="bg-muted/50 p-4 rounded-lg mb-6">
              <p className="text-sm text-muted-foreground mb-1">ID de Orden:</p>
              <p className="font-mono text-sm font-medium">{completedOrderId}</p>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Recibirás una confirmación por correo una vez se complete el pago.
              El estado de tu donación se actualizará automáticamente.
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/donator">
                <Button className="w-full">
                  Ver mis donaciones
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Volver al inicio
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-background">
      {/* Hero */}
      <section className="py-12 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <Heart className="w-12 h-12 mx-auto mb-4 text-primary-foreground" />
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            {t.donation.title}
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            {t.donation.subtitle}
          </p>
        </div>
      </section>

      {/* Donation Form */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {s}
                  </div>
                  {s < 3 && (
                    <div className={`w-16 h-1 ${step > s ? 'bg-primary' : 'bg-muted'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Amount */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{t.donation.selectAmount}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {amounts.map((a) => (
                      <Button
                        key={a}
                        variant={amount === a ? 'default' : 'outline'}
                        className="h-16 text-lg"
                        onClick={() => {
                          setAmount(a);
                          setCustomAmount('');
                        }}
                      >
                        {formatCurrency(a)}
                      </Button>
                    ))}
                  </div>

                  <div>
                    <Label htmlFor="custom">{t.donation.customAmount}</Label>
                    <Input
                      id="custom"
                      type="number"
                      placeholder="Ingresa otro monto"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setAmount(null);
                      }}
                      className="mt-2"
                    />
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    disabled={!finalAmount}
                    onClick={() => setStep(2)}
                  >
                    Continuar
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Destination */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{t.donation.selectDestination}</CardTitle>
                  <CardDescription>
                    Elige si deseas donar al fondo general o a un proyecto específico
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup value={destination} onValueChange={(value) => setDestination(value as 'free' | 'project')}>
                    {/* Opción: Fondo General */}
                    <div className="flex items-start space-x-3 p-4 rounded-lg border border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
                      <RadioGroupItem value="free" id="free" className="mt-1" />
                      <Label htmlFor="free" className="flex-1 cursor-pointer">
                        <div className="flex items-start gap-3">
                          <Heart className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <div className="font-medium text-primary mb-1">
                              Fondo General UAO
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Tu donación se utilizará donde más se necesite para apoyar a los estudiantes y proyectos de la universidad
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>

                    {/* Opción: Proyecto Específico */}
                    <div className="flex items-start space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="project" id="project" className="mt-1" />
                      <Label htmlFor="project" className="flex-1 cursor-pointer">
                        <div className="font-medium mb-2">Proyecto Específico</div>
                        <div className="text-sm text-muted-foreground mb-3">
                          Elige un proyecto al que deseas destinar tu donación
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {/* Selector de proyectos si elige "project" */}
                  {destination === 'project' && (
                    <div className="space-y-3">
                      <Label>Selecciona un proyecto</Label>
                      {projectsLoading ? (
                        <div className="text-sm text-muted-foreground">Cargando proyectos...</div>
                      ) : (
                        <RadioGroup value={selectedProject} onValueChange={setSelectedProject}>
                          {projects.filter(p => p.status === 'active').map((project) => (
                            <div key={project.project_id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                              <RadioGroupItem value={project.project_id} id={project.project_id} className="mt-1" />
                              <Label htmlFor={project.project_id} className="flex-1 cursor-pointer">
                                <div className="font-medium">{project.name}</div>
                                <div className="text-xs text-muted-foreground mt-1">{project.category}</div>
                                {project.description && (
                                  <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{project.description}</div>
                                )}
                                <div className="text-xs text-primary mt-2">
                                  Meta: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(project.goal)} • Progreso: {project.progress}%
                                </div>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      )}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Atrás
                    </Button>
                    <Button 
                      className="flex-1" 
                      onClick={() => {
                        if (destination === 'free') {
                          setSelectedProject('free');
                        }
                        setStep(3);
                      }}
                      disabled={destination === 'project' && !selectedProject}
                    >
                      Continuar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Confirmación y Pago con Bold */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Confirma tu Donación</CardTitle>
                  <CardDescription>
                    Procesaremos tu pago de forma segura con Bold Payment Gateway
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Descripción opcional */}
                  <div>
                    <Label htmlFor="description">Mensaje o dedicatoria (opcional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Escribe un mensaje para acompañar tu donación..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="mt-2"
                    />
                  </div>

                  {/* Resumen de donación */}
                  <div className="bg-muted/50 p-6 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total a donar:</span>
                      <span className="text-3xl font-bold text-primary">{formatCurrency(finalAmount)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Destino:</strong> {
                        destination === 'free' 
                          ? 'Fondo General UAO' 
                          : projects.find(p => p.project_id === selectedProject)?.name || 'Proyecto seleccionado'
                      }</p>
                      {user && <p><strong>Donante:</strong> {user.email}</p>}
                    </div>
                  </div>

                  {/* Información de seguridad */}
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Pago seguro con Bold
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                          Tu información de pago es procesada de forma segura. No almacenamos datos de tarjetas.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Métodos de pago disponibles */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Métodos de pago disponibles:</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Zap className="w-4 h-4" />
                      <span>Tarjeta de crédito/débito • PSE • Nequi • Daviplata</span>
                    </div>
                  </div>

                  {/* Error de Bold */}
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Nota de autenticación */}
                  {!user && (
                    <Alert>
                      <AlertDescription>
                        Debes iniciar sesión para realizar una donación.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Botones de acción */}
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep(2)} disabled={isLoading}>
                      Atrás
                    </Button>
                    <Button 
                      className="flex-1 gap-2" 
                      size="lg"
                      onClick={handlePayment}
                      disabled={isLoading || !user}
                    >
                      {isLoading ? (
                        <>Procesando...</>
                      ) : (
                        <>
                          <Heart className="w-5 h-5" />
                          Proceder al pago
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    Al continuar, aceptas que procesaremos tu donación a través de Bold Payment Gateway
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DonationPage;