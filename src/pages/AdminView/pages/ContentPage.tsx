import { Upload, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentDialog } from '../components/ContentDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAdminDashboard } from '@/hooks/useAdminView';

const ContentPage = () => {
  const {
    showContentDialog,
    setShowContentDialog,
    contentForm,
    setContentForm,
    handleManageContent,
    handleUploadContent,
  } = useAdminDashboard();

  // Mock data para el contenido (esto debería venir del hook en el futuro)
  const contentItems = [
    { id: 1, title: 'Banner Principal', type: 'Imagen', section: 'Inicio', status: 'Activo', updated: '2026-01-05' },
    { id: 2, title: 'Video Institucional', type: 'Video', section: 'Quiénes Somos', status: 'Activo', updated: '2026-01-03' },
    { id: 3, title: 'Testimonio Juan P.', type: 'Texto', section: 'Testimonios', status: 'Activo', updated: '2026-01-01' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Contenido</h2>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button 
            onClick={handleManageContent}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Subir Contenido
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Content Table */}
        <Card>
          <CardHeader>
            <CardTitle>Contenido Multimedia</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Sección</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Última Actualización</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contentItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.type}</Badge>
                    </TableCell>
                    <TableCell>{item.section}</TableCell>
                    <TableCell>
                      <Badge variant="default">{item.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(item.updated).toLocaleDateString('es-CO')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost">
                          Editar
                        </Button>
                        <Button size="sm" variant="ghost">
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Content Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-foreground mb-1">24</div>
              <p className="text-sm text-muted-foreground">Imágenes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-foreground mb-1">8</div>
              <p className="text-sm text-muted-foreground">Videos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-foreground mb-1">156</div>
              <p className="text-sm text-muted-foreground">Textos</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content Dialog */}
      <ContentDialog
        open={showContentDialog}
        onOpenChange={setShowContentDialog}
        contentForm={contentForm}
        onContentFormChange={setContentForm}
        onUpload={handleUploadContent}
      />
    </div>
  );
};

export default ContentPage;
