import { Target, Calendar, Download, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { Project } from '@/types';

interface ProjectsViewProps {
  projects: Project[];
  onCreateProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: number) => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
  formatCurrency: (value: number) => string;
}

export const ProjectsView = ({
  projects,
  onCreateProject,
  onEditProject,
  onDeleteProject,
  onExportExcel,
  onExportPDF,
  formatCurrency,
}: ProjectsViewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Proyectos en Curso
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onExportExcel}>
              <Download className="w-3 h-3 mr-1" />
              Excel
            </Button>
            <Button size="sm" variant="outline" onClick={onExportPDF}>
              <Download className="w-3 h-3 mr-1" />
              PDF
            </Button>
            <Button size="sm" variant="outline" onClick={onCreateProject}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="space-y-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm font-medium text-foreground">
                    {project.name}
                  </span>
                  <Badge
                    variant={
                      project.priority === "high"
                        ? "destructive"
                        : project.priority === "medium"
                        ? "default"
                        : "secondary"
                    }
                    className="text-xs"
                  >
                    {project.priority === "high"
                      ? "Alta"
                      : project.priority === "medium"
                      ? "Media"
                      : "Baja"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {project.type === "investment" ? "Inversión" : "Libre"}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => onEditProject(project)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => onDeleteProject(project.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{project.category}</span>
                  <span>
                    {formatCurrency(project.raised)} / {formatCurrency(project.goal)}
                  </span>
                </div>
                <Progress value={project.progress} />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{project.progress}% completado</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {project.deadline}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
