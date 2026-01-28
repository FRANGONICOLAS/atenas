import { ImageIcon, Plus, Edit } from 'lucide-react';
import type { SiteContent, SiteContentFormData } from '@/types';

interface ContentRequiredSummaryProps {
  contents: SiteContent[];
  handleOpenEdit: (content: SiteContent) => void;
  setIsCreating: (value: boolean) => void;
  setFile: (value: File | null) => void;
  setPreviewUrl: (value: string | null) => void;
  setFormData: (value: SiteContentFormData) => void;
  setShowDialog: (value: boolean) => void;
  setEditingContent: (value: SiteContent | null) => void;
}

export const ContentRequiredSummary = ({
  contents,
  handleOpenEdit,
  setIsCreating,
  setFile,
  setPreviewUrl,
  setFormData,
  setShowDialog,
  setEditingContent,
}: ContentRequiredSummaryProps) => {
  return (
    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
        <ImageIcon className="w-4 h-4" />
        Contenido Requerido para Página de Inicio:
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
        {[
          { key: 'home_hero', name: 'Hero Principal' },
          { key: 'home_problem', name: 'La Problemática' },
          { key: 'home_impact', name: 'Nuestro Impacto' },
          { key: 'home_transformation_1', name: 'Transformación #1' },
          { key: 'home_transformation_2', name: 'Transformación #2' },
          { key: 'home_transformation_3', name: 'Transformación #3' },
          { key: 'home_transformation_4', name: 'Transformación #4' },
          { key: 'home_transformation_5', name: 'Transformación #5' },
          { key: 'home_transformation_6', name: 'Transformación #6' },
          { key: 'home_projects', name: 'Donaciones (3 imágenes)' },
          { key: 'home_cta', name: 'Llamado a la Acción (CTA)' },
        ].map(({ key, name }) => {
          const exists = contents.find(c => c.content_key === key && c.is_active);
          return (
            <div 
              key={key} 
              className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-all hover:shadow-md ${
                exists ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100'
              }`}
              onClick={() => {
                if (exists) {
                  handleOpenEdit(exists);
                } else {
                  setIsCreating(true);
                  setFile(null);
                  setPreviewUrl(null);
                  setFormData({
                    content_key: key,
                    title: name,
                    description: '',
                    page_section: 'home',
                    content_type: 'image',
                    category: '',
                    video_url: '',
                  });
                  setShowDialog(true);
                }
              }}
            >
              {exists ? (
                <span className="text-green-600 font-bold">✓</span>
              ) : (
                <span className="text-red-600 font-bold">✗</span>
              )}
              <div className="flex-1 min-w-0">
                <code className="text-[10px] text-muted-foreground block truncate">{key}</code>
                <span className="text-xs">{name}</span>
              </div>
              {!exists && (
                <Plus className="w-3 h-3 text-red-600" />
              )}
              {exists && (
                <Edit className="w-3 h-3 text-green-600" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
