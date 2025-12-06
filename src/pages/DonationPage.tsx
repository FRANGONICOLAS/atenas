import { useState } from 'react';
import { Heart, CreditCard, Check, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const DonationPage = () => {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [destination, setDestination] = useState('free');
  const [selectedProject, setSelectedProject] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const amounts = [50000, 100000, 200000, 500000];

  const projects = [
    { id: 'cancha', name: 'Cancha Sintética Sede Norte' },
    { id: 'becas', name: 'Programa de Becas Académicas' },
    { id: 'nutricion', name: 'Programa de Nutrición' },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsComplete(true);
    toast.success('¡Donación procesada exitosamente!');
  };

  const finalAmount = amount || parseInt(customAmount) || 0;

  if (isComplete) {
    return (
      <div className="min-h-screen pt-20 bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
              <Check className="w-10 h-10 text-secondary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {t.donation.thankYou}
            </h2>
            <p className="text-muted-foreground mb-6">
              Tu donación de {formatCurrency(finalAmount)} ha sido procesada exitosamente. 
              Recibirás un correo de confirmación pronto.
            </p>
            <Link to="/">
              <Button className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio
              </Button>
            </Link>
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
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup value={destination} onValueChange={setDestination}>
                    <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary cursor-pointer">
                      <RadioGroupItem value="free" id="free" />
                      <Label htmlFor="free" className="cursor-pointer flex-1">
                        <div className="font-medium">{t.donation.freeInvestment}</div>
                        <div className="text-sm text-muted-foreground">
                          Tu donación se usará donde más se necesite
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary cursor-pointer">
                      <RadioGroupItem value="project" id="project" />
                      <Label htmlFor="project" className="cursor-pointer flex-1">
                        <div className="font-medium">{t.donation.specificProject}</div>
                        <div className="text-sm text-muted-foreground">
                          Elige un proyecto específico para apoyar
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {destination === 'project' && (
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un proyecto" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Atrás
                    </Button>
                    <Button 
                      className="flex-1" 
                      onClick={() => setStep(3)}
                      disabled={destination === 'project' && !selectedProject}
                    >
                      Continuar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{t.donation.personalInfo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">{t.donation.name}</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{t.donation.email}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">{t.donation.phone}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="mt-2"
                    />
                  </div>

                  <div className="border-t border-border pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <span className="font-medium text-foreground">Información de pago</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="card">Número de tarjeta</Label>
                        <Input
                          id="card"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                          className="mt-2"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Fecha de expiración</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/AA"
                            value={formData.expiry}
                            onChange={(e) => setFormData({...formData, expiry: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={formData.cvv}
                            onChange={(e) => setFormData({...formData, cvv: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total a donar:</span>
                      <span className="text-2xl font-bold text-foreground">{formatCurrency(finalAmount)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Destino: {destination === 'free' ? 'Inversión libre' : projects.find(p => p.id === selectedProject)?.name}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      Atrás
                    </Button>
                    <Button 
                      className="flex-1 gap-2" 
                      size="lg"
                      onClick={handleSubmit}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>Procesando...</>
                      ) : (
                        <>
                          <Heart className="w-5 h-5" />
                          {t.donation.processPayment}
                        </>
                      )}
                    </Button>
                  </div>
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
