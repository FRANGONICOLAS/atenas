import { Link } from 'react-router-dom';
import { Target, Heart, Calendar, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import CTA from '@/components/CTA';

const ProjectsPage = () => {
  const { t } = useLanguage();

  const projects = [
    {
      id: 1,
      title: 'Cancha Sintética Sede Norte',
      description: 'Construcción de una cancha de fútbol sintética para mejorar las condiciones de entrenamiento de nuestros jóvenes.',
      goal: 25000000,
      raised: 18500000,
      status: 'active',
      category: 'Infraestructura',
      startDate: '2024-01-15',
      endDate: '2024-12-31',
      milestones: [
        { title: 'Compra de terreno', completed: true },
        { title: 'Permisos municipales', completed: true },
        { title: 'Inicio de obras', completed: true },
        { title: 'Instalación del césped', completed: false },
        { title: 'Inauguración', completed: false },
      ],
      image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600&h=400&fit=crop',
    },
    {
      id: 2,
      title: 'Uniformes y Equipamiento 2026',
      description: 'Dotación completa de uniformes, balones, conos y material deportivo para todas las categorías.',
      goal: 8000000,
      raised: 8000000,
      status: 'completed',
      category: 'Equipamiento',
      startDate: '2024-02-01',
      endDate: '2024-04-30',
      milestones: [
        { title: 'Diseño de uniformes', completed: true },
        { title: 'Producción', completed: true },
        { title: 'Entrega a jugadores', completed: true },
      ],
      image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&h=400&fit=crop',
    },
    {
      id: 3,
      title: 'Programa de Becas Académicas',
      description: 'Apoyo educativo para jugadores destacados, cubriendo útiles escolares y tutorías.',
      goal: 15000000,
      raised: 7200000,
      status: 'active',
      category: 'Educación',
      startDate: '2024-03-01',
      endDate: '2024-12-31',
      milestones: [
        { title: 'Selección de beneficiarios', completed: true },
        { title: 'Entrega de útiles', completed: true },
        { title: 'Inicio de tutorías', completed: false },
        { title: 'Seguimiento académico', completed: false },
      ],
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop',
    },
    {
      id: 4,
      title: 'Programa de Nutrición',
      description: 'Suplementos nutricionales y refrigerios saludables para todos los jugadores después de cada entrenamiento.',
      goal: 12000000,
      raised: 3500000,
      status: 'active',
      category: 'Salud',
      startDate: '2024-04-01',
      endDate: '2024-12-31',
      milestones: [
        { title: 'Evaluación nutricional', completed: true },
        { title: 'Convenio con proveedores', completed: false },
        { title: 'Inicio de entregas', completed: false },
      ],
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop',
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPercentage = (raised: number, goal: number) => {
    return Math.min(Math.round((raised / goal) * 100), 100);
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            {t.projects.title}
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
            {t.projects.subtitle}
          </p>
        </div>
      </section>

      {/* Summary Stats */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{projects.length}</div>
              <div className="text-muted-foreground">Proyectos Totales</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">{projects.filter(p => p.status === 'active').length}</div>
              <div className="text-muted-foreground">Proyectos Activos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">
                {formatCurrency(projects.reduce((acc, p) => acc + p.raised, 0))}
              </div>
              <div className="text-muted-foreground">Total Recaudado</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">
                {formatCurrency(projects.reduce((acc, p) => acc + p.goal, 0))}
              </div>
              <div className="text-muted-foreground">Meta Total</div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <div className="relative h-48">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                      {project.status === 'active' ? t.projects.active : t.projects.completed}
                    </Badge>
                    <Badge variant="outline" className="bg-card/80">
                      {project.category}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">{project.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{project.description}</p>
                  
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">
                        {t.projects.raised}: <span className="font-medium text-foreground">{formatCurrency(project.raised)}</span>
                      </span>
                      <span className="text-muted-foreground">
                        {t.projects.goal}: {formatCurrency(project.goal)}
                      </span>
                    </div>
                    <Progress value={getPercentage(project.raised, project.goal)} className="h-3" />
                    <div className="text-right text-sm font-medium text-primary mt-1">
                      {getPercentage(project.raised, project.goal)}%
                    </div>
                  </div>

                  {/* Milestones */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Etapas del proyecto
                    </h4>
                    <div className="space-y-2">
                      {project.milestones.map((milestone, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          {milestone.completed ? (
                            <CheckCircle className="w-4 h-4 text-secondary" />
                          ) : (
                            <Clock className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className={milestone.completed ? 'text-foreground' : 'text-muted-foreground'}>
                            {milestone.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(project.startDate).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                    </div>
                    <span>-</span>
                    <div>
                      {new Date(project.endDate).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  {project.status === 'active' && (
                    <Link to="/donar">
                      <Button className="w-full gap-2">
                        <Heart className="w-4 h-4" />
                        {t.projects.support}
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </div>
  );
};

export default ProjectsPage;
