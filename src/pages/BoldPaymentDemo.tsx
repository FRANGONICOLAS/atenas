import { useState } from 'react';
import { BoldDonationForm } from '@/components/payment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Code, Rocket, Shield } from 'lucide-react';

export default function BoldPaymentDemo() {
  const [completedOrders, setCompletedOrders] = useState<string[]>([]);

  const handleDonationSuccess = (orderId: string) => {
    setCompletedOrders((prev) => [...prev, orderId]);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Integración Bold Payment Gateway
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Sistema de pagos seguro y confiable para procesar donaciones
        </p>
      </div>

      <Tabs defaultValue="demo" className="space-y-8">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="demo">Demo</TabsTrigger>
          <TabsTrigger value="features">Características</TabsTrigger>
          <TabsTrigger value="integration">Integración</TabsTrigger>
        </TabsList>

        {/* Demo Tab */}
        <TabsContent value="demo" className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Formulario de donación */}
            <div>
              <BoldDonationForm
                projectName="Proyecto de Ejemplo"
                projectId="demo-project-001"
                suggestedAmounts={[5000, 10000, 25000, 50000]}
                onSuccess={handleDonationSuccess}
              />
            </div>

            {/* Información lateral */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estado de Transacciones</CardTitle>
                  <CardDescription>
                    Órdenes iniciadas en esta sesión
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {completedOrders.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay transacciones iniciadas aún
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {completedOrders.map((orderId) => (
                        <div
                          key={orderId}
                          className="flex items-center gap-2 p-3 bg-green-50 rounded-lg"
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-mono">{orderId}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ambiente de Pruebas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline">Sandbox</Badge>
                    <p className="text-sm text-muted-foreground">
                      Estás usando el ambiente de pruebas de Bold. 
                      No se procesarán cargos reales.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                    <p className="text-sm font-medium">Montos de prueba:</p>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• $1.000 - $2.000.000: Aprobado</li>
                      <li>• $111.111: Fondos insuficientes</li>
                      <li>• $222.222: PIN inválido</li>
                      <li>• $333.333: Tarjeta vencida</li>
                      <li>• $444.444: Fallo de red</li>
                      <li>• $999.999: Rechazo general</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Seguridad</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Firma de integridad HMAC</li>
                  <li>✓ Verificación de webhooks</li>
                  <li>✓ Transacciones cifradas</li>
                  <li>✓ Cumplimiento PCI DSS</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Rocket className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Características</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Múltiples métodos de pago</li>
                  <li>✓ Checkout personalizable</li>
                  <li>✓ Montos dinámicos</li>
                  <li>✓ Ambiente sandbox</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Code className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Tecnología</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ React + TypeScript</li>
                  <li>✓ Hooks personalizados</li>
                  <li>✓ Integración con Supabase</li>
                  <li>✓ Componentes reutilizables</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integration Tab */}
        <TabsContent value="integration">
          <Card>
            <CardHeader>
              <CardTitle>Guía de Integración</CardTitle>
              <CardDescription>
                Pasos para integrar Bold en tu aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">1. Usar el componente de formulario</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`import { BoldDonationForm } from '@/components/payment';

function MyPage() {
  return (
    <BoldDonationForm
      projectName="Mi Proyecto"
      projectId="project-123"
      suggestedAmounts={[10000, 25000, 50000]}
      onSuccess={(orderId) => {
        console.log('Pago iniciado:', orderId);
      }}
    />
  );
}`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. Usar solo el botón de pago</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`import { BoldPaymentButton } from '@/components/payment';

function MyComponent() {
  return (
    <BoldPaymentButton
      amount={50000}
      currency="COP"
      description="Donación"
      projectId="project-123"
      onSuccess={(orderId) => alert(\`Orden: \${orderId}\`)}
    />
  );
}`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. Usar el hook directamente</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`import { useBoldCheckout } from '@/hooks/useBoldCheckout';

function CustomComponent() {
  const { openCheckout, isLoading } = useBoldCheckout({
    amount: 100000,
    currency: 'COP',
    description: 'Mi pago personalizado',
    onSuccess: (orderId) => console.log(orderId)
  });

  return (
    <button onClick={openCheckout} disabled={isLoading}>
      Pagar con Bold
    </button>
  );
}`}
                </pre>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">⚠️ Importante - Backend</h4>
                <p className="text-sm text-muted-foreground">
                  Debes implementar el endpoint <code className="bg-white px-2 py-1 rounded">/api/bold/signature</code> 
                  {' '}en tu backend para generar la firma de integridad de forma segura.
                  Nunca calcules la firma en el cliente.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
