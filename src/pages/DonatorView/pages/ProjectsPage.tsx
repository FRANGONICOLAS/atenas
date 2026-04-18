import { Link } from 'react-router-dom';
import { ArrowRight, RefreshCw, Trophy } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const ProjectsPage = () => {
  const { projects, projectsLoading, loadProjects, formatCurrency } = useProjects();
  const activeProjects = projects.filter((project) => project.status === 'active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Proyectos para Apoyar</h2>
        </div>
        <Button variant="outline" size="sm" onClick={loadProjects} disabled={projectsLoading}>
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {projectsLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-5 space-y-3">
                <div className="h-5 w-2/3 rounded bg-muted" />
                <div className="h-4 w-1/2 rounded bg-muted" />
                <div className="h-2 w-full rounded bg-muted" />
                <div className="h-4 w-1/3 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!projectsLoading && activeProjects.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No hay proyectos activos para apoyar en este momento.</p>
        </div>
      )}

      {!projectsLoading && activeProjects.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {activeProjects.map((project) => (
            <Card
              key={project.project_id ?? project.id}
              className="border border-border/60 bg-gradient-to-br from-background to-muted/20"
            >
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-lg leading-tight">{project.name}</CardTitle>
                  <Badge variant="outline">{project.category}</Badge>
                </div>
                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="font-semibold">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Recaudado: {formatCurrency(project.raised)}</span>
                    <span>Meta: {formatCurrency(project.goal)}</span>
                  </div>
                </div>

                <Link
                  to={project.project_id ? `/donation?project_id=${project.project_id}` : '/donation'}
                  className="block"
                >
                  <Button className="w-full gap-2">
                    Donar a este proyecto
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
