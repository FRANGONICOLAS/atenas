import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HomePagePreview } from './HomePagePreview';
import { AboutWhatWeDoPreview } from './AboutWhatWeDoPreview';
import { CategoriesPagePreview } from './CategoriesPagePreview';
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
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="home">Inicio</TabsTrigger>
        <TabsTrigger value="about">Quiénes Somos</TabsTrigger>
        <TabsTrigger value="categories">Categorías</TabsTrigger>
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
        <AboutWhatWeDoPreview
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

      <TabsContent value="categories">
        <CategoriesPagePreview
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
    </Tabs>
  );
};
