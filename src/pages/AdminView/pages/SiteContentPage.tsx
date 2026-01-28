import { ImageIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FullScreenLoader } from '@/components/common/FullScreenLoader';
import DeleteConfirmation from '@/components/modals/DeleteConfirmation';
import { useSiteContentManagement } from '@/hooks/useSiteContentManagement';
import {
  SiteContentStats,
  SiteContentPageTabs,
  SiteContentTable,
  SiteContentDialog,
} from '@/pages/AdminView/components/SiteContent';

const SiteContentPage = () => {
  const {
    contents,
    loading,
    showDialog,
    setShowDialog,
    activePageTab,
    setActivePageTab,
    editingContent,
    setEditingContent,
    deleteTarget,
    setDeleteTarget,
    stats,
    file,
    setFile,
    previewUrl,
    setPreviewUrl,
    isCreating,
    setIsCreating,
    formData,
    setFormData,
    handleOpenEdit,
    handleOpenCreate,
    handleImageChange,
    handleSubmit,
    handleDelete,
    handleToggleActive,
    getPageSectionLabel,
  } = useSiteContentManagement();

  if (loading) {
    return <FullScreenLoader message="Cargando contenidos del sitio..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Contenido de Páginas Públicas</h2>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Contenido
        </Button>
      </div>

      {/* Content Stats */}
      <SiteContentStats stats={stats} />

      {/* Page Tabs with Preview */}
      <SiteContentPageTabs
        activePageTab={activePageTab}
        setActivePageTab={setActivePageTab}
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

      {/* Content Table */}
      <SiteContentTable
        contents={contents}
        activePageTab={activePageTab}
        getPageSectionLabel={getPageSectionLabel}
        handleToggleActive={handleToggleActive}
        handleOpenEdit={handleOpenEdit}
        setDeleteTarget={setDeleteTarget}
      />

      {/* Create/Edit Dialog */}
      <SiteContentDialog
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        isCreating={isCreating}
        editingContent={editingContent}
        formData={formData}
        setFormData={setFormData}
        file={file}
        previewUrl={previewUrl}
        handleImageChange={handleImageChange}
        handleSubmit={handleSubmit}
        getPageSectionLabel={getPageSectionLabel}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmation
        open={!!deleteTarget}
        targetName={deleteTarget?.title}
        description="Esta acción no se puede deshacer. Se eliminará el contenido y su archivo del almacenamiento."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.content_id)}
      />
    </div>
  );
};

export default SiteContentPage;
