import { Eye, EyeOff, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import type { SiteContent } from '@/types';

interface SiteContentTableProps {
  contents: SiteContent[];
  activePageTab: string;
  getPageSectionLabel: (section: string) => string;
  handleToggleActive: (content: SiteContent) => void;
  handleOpenEdit: (content: SiteContent) => void;
  setDeleteTarget: (content: SiteContent) => void;
}

export const SiteContentTable = ({
  contents,
  activePageTab,
  getPageSectionLabel,
  handleToggleActive,
  handleOpenEdit,
  setDeleteTarget,
}: SiteContentTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contenido de {getPageSectionLabel(activePageTab)}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vista Previa</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Clave</TableHead>
              <TableHead>Sección</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Última Actualización</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(() => {
              const filteredContents = contents.filter(c => c.page_section === activePageTab);
              
              if (filteredContents.length === 0) {
                return (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No hay contenidos para {getPageSectionLabel(activePageTab)}
                    </TableCell>
                  </TableRow>
                );
              }
              
              return filteredContents.map((content) => (
                <TableRow key={content.content_id}>
                  <TableCell>
                    <img 
                      src={content.public_url} 
                      alt={content.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{content.title}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {content.content_key}
                    </code>
                  </TableCell>
                  <TableCell>{getPageSectionLabel(content.page_section)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {content.content_type === 'image' ? 'Foto' : 'Video'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={content.is_active ? 'default' : 'secondary'}>
                      {content.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(content.updated_at).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => handleToggleActive(content)}
                        title={content.is_active ? 'Desactivar' : 'Activar'}
                      >
                        {content.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => handleOpenEdit(content)}
                        title="Cambiar imagen"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => setDeleteTarget(content)}
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ));
            })()}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
