import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Target, Heart, Calendar, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import CTA from '@/components/CTA';
import { FullScreenLoader } from '@/components/common/FullScreenLoader';
import { projectService } from '@/api/services';
import type { ProjectDB } from '@/types/project.types';

interface ProjectWithStats extends ProjectDB {
  raised: number;
  percentage: number;
  image: string;
}

const ProjectsPage = () => {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Imágenes por defecto para los proyectos
  const defaultImages = [
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop',
  ];

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getAll();
      
      // Cargar datos adicionales para cada proyecto
      const projectsWithStats = await Promise.all(
        data.map(async (project, index) => {
          const raised = await projectService.getTotalRaised(project.project_id);
          const goal = project.finance_goal || 0;
          const percentage = goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0;
          
          return {
            ...project,
            raised,
            percentage,
            image: defaultImages[index % defaultImages.length],
          };
        })
      );
      
      setProjects(projectsWithStats);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return t.projects.active;
      case 'completed':
        return t.projects.completed;
      default:
        return 'Pendiente';
    }
  };

  const totalRaised = projects.reduce((acc, p) => acc + p.raised, 0);
  const totalGoal = projects.reduce((acc, p) => acc + (p.finance_goal || 0), 0);
  const activeProjects = projects.filter(p => p.status === 'active').length;

  if (loading) {
    return <FullScreenLoader message="Cargando proyectos..." />;
  }

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
              <div className="text-3xl font-bold text-secondary">{activeProjects}</div>
              <div className="text-muted-foreground">Proyectos Activos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">
                {formatCurrency(totalRaised)}
              </div>
              <div className="text-muted-foreground">Total Recaudado</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">
                {formatCurrency(totalGoal)}
              </div>
              <div className="text-muted-foreground">Meta Total</div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">No hay proyectos disponibles</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {projects.map((project) => (
                <Card key={project.project_id} className="overflow-hidden">
                  <div className="relative h-48">
                    <img 
                      src={project.image} 
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {getStatusLabel(project.status)}
                      </Badge>
                      {project.category && (
                        <Badge variant="outline" className="bg-card/80">
                          {project.category}
                        </Badge>
                      )}
                      {project.type && (
                        <Badge variant="outline" className="bg-card/80">
                          {project.type === 'investment' ? 'Inversión' : 'Inversión Libre'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl text-foreground">{project.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {project.description && (
                      <p className="text-muted-foreground">{project.description}</p>
                    )}
                    
                    {/* Progress */}
                    {project.finance_goal && project.finance_goal > 0 && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">
                            {t.projects.raised}: <span className="font-medium text-foreground">{formatCurrency(project.raised)}</span>
                          </span>
                          <span className="text-muted-foreground">
                            {t.projects.goal}: {formatCurrency(project.finance_goal)}
                          </span>
                        </div>
                        <Progress value={project.percentage} className="h-3" />
                        <div className="text-right text-sm font-medium text-primary mt-1">
                          {project.percentage}%
                        </div>
                      </div>
                    )}

                    {/* Dates */}
                    {(project.start_date || project.end_date) && (
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {project.start_date && (
                          <>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(project.start_date).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                            </div>
                            {project.end_date && <span>-</span>}
                          </>
                        )}
                        {project.end_date && (
                          <div>
                            {new Date(project.end_date).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                          </div>
                        )}
                      </div>
                    )}

                    {project.status === 'active' && (
                      <Link to="/donar" className="block mt-6">
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
          )}
        </div>
      </section>

      <CTA />
    </div>
  );
};

export default ProjectsPage;
