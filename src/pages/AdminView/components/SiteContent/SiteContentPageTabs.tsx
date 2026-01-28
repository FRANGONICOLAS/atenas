import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HomePagePreview } from './HomePagePreview';
import { ContentRequiredSummary } from './ContentRequiredSummary';
import type { SiteContent, SiteContentFormData } from '@/types';

interface SiteContentPageTabsProps {
  activePageTab: string;
  setActivePageTab: (value: string) => void;
  contents: SiteContent[];
  handleOpenEdit: (content: SiteContent) => void;
  handleOpenCreate: () => void;
  setIsCreating: (value: boolean) => void;
  setFile: (value: File | null) => void;
  setPreviewUrl: (value: string | null) => void;
  setFormData: (value: SiteContentFormData) => void;
  setShowDialog: (value: boolean) => void;
  setEditingContent: (value: SiteContent | null) => void;
}

export const SiteContentPageTabs = ({
  activePageTab,
  setActivePageTab,
  contents,
  handleOpenEdit,
  handleOpenCreate,
  setIsCreating,
  setFile,
  setPreviewUrl,
  setFormData,
  setShowDialog,
  setEditingContent,
}: SiteContentPageTabsProps) => {
  return (
    <Tabs value={activePageTab} onValueChange={setActivePageTab}>
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="home">Inicio</TabsTrigger>
        <TabsTrigger value="about">Quiénes Somos</TabsTrigger>
        <TabsTrigger value="contact">Contacto</TabsTrigger>
        <TabsTrigger value="donation">Donaciones</TabsTrigger>
        <TabsTrigger value="gallery">Galería</TabsTrigger>
        <TabsTrigger value="projects">Proyectos</TabsTrigger>
      </TabsList>

      <TabsContent value="home">
        <HomePagePreview
          contents={contents}
          handleOpenEdit={handleOpenEdit}
          handleOpenCreate={handleOpenCreate}
          setIsCreating={setIsCreating}
          setFile={setFile}
          setPreviewUrl={setPreviewUrl}
          setFormData={setFormData}
          setShowDialog={setShowDialog}
          setEditingContent={setEditingContent}
        />
        <ContentRequiredSummary
          contents={contents}
          handleOpenEdit={handleOpenEdit}
          setIsCreating={setIsCreating}
          setFile={setFile}
          setPreviewUrl={setPreviewUrl}
          setFormData={setFormData}
          setShowDialog={setShowDialog}
          setEditingContent={setEditingContent}
        />
      </TabsContent>

      <TabsContent value="about">
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">Vista previa de la página "Quiénes Somos" en desarrollo</p>
        </div>
      </TabsContent>

      <TabsContent value="contact">
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">Vista previa de la página "Contacto" en desarrollo</p>
        </div>
      </TabsContent>

      <TabsContent value="donation">
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">Vista previa de la página "Donaciones" en desarrollo</p>
        </div>
      </TabsContent>

      <TabsContent value="gallery">
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">Vista previa de la página "Galería" en desarrollo</p>
        </div>
      </TabsContent>

      <TabsContent value="projects">
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">Vista previa de la página "Proyectos" en desarrollo</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};
