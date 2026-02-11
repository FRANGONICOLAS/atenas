import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SiteContent, SiteContentFormData } from "@/types";

interface CategoriesPagePreviewProps {
  contents: SiteContent[];
  handleOpenEdit: (content: SiteContent) => void;
  setIsCreating: (value: boolean) => void;
  setFile: (value: File | null) => void;
  setPreviewUrl: (value: string | null) => void;
  setFormData: (value: SiteContentFormData) => void;
  setShowDialog: (value: boolean) => void;
  setEditingContent: (value: SiteContent | null) => void;
}

export const CategoriesPagePreview = ({
  contents,
  handleOpenEdit,
  setIsCreating,
  setFile,
  setPreviewUrl,
  setFormData,
  setShowDialog,
  setEditingContent,
}: CategoriesPagePreviewProps) => {
  const createContent = (contentKey: string, title: string) => {
    setEditingContent(null);
    setIsCreating(true);
    setFile(null);
    setPreviewUrl(null);
    setFormData({
      content_key: contentKey,
      title,
      description: "",
      page_section: "categories",
      content_type: "image",
      category: "",
      video_url: "",
    });
    setShowDialog(true);
  };

  const getContent = (contentKey: string) =>
    contents.find((content) => content.content_key === contentKey && content.is_active);

  const items = [
    { key: "categories_sub6", title: "Categoria Sub 6", ageRange: "6-8", color: "bg-chart-1" },
    { key: "categories_sub8", title: "Categoria Sub 8", ageRange: "6-8", color: "bg-chart-1" },
    { key: "categories_sub10", title: "Categoria Sub 10", ageRange: "8-10", color: "bg-chart-2" },
    { key: "categories_sub12", title: "Categoria Sub 12", ageRange: "10-12", color: "bg-chart-3" },
    { key: "categories_sub14", title: "Categoria Sub 14", ageRange: "12-14", color: "bg-chart-4" },
    { key: "categories_sub16", title: "Categoria Sub 16", ageRange: "15-17", color: "bg-chart-5" },
    { key: "categories_sub18", title: "Categoria Sub 18", ageRange: "15-17", color: "bg-chart-5" },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Vista Previa: Categorias</CardTitle>
          <Badge variant="outline" className="text-xs">
            Haz clic en cualquier imagen para editarla
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="border rounded-lg overflow-hidden bg-background"
          style={{
            transform: "scale(0.8)",
            transformOrigin: "top",
            height: "620px",
            overflowY: "auto",
          }}
        >
          <div className="space-y-0">
            <div className="bg-primary py-8 px-4 text-center text-primary-foreground">
              <h2 className="text-xl font-bold">Categorias</h2>
              <p className="text-xs opacity-80">Conoce nuestras categorias por edad</p>
            </div>

            <div className="bg-background py-6 px-4">
              <div className="space-y-6 max-w-4xl mx-auto">
                {items.map((item, index) => {
                  const content = getContent(item.key);
                  return (
                    <div key={item.key} className="overflow-hidden rounded-lg border bg-card">
                      <div className={`grid grid-cols-2 gap-0 ${index % 2 === 1 ? "" : ""}`}>
                        <div
                          className={`relative h-28 group cursor-pointer ${index % 2 === 1 ? "order-2" : "order-1"}`}
                          onClick={() =>
                            content ? handleOpenEdit(content) : createContent(item.key, item.title)
                          }
                        >
                          {content ? (
                            <>
                              <img
                                src={content.public_url}
                                alt={item.title}
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Badge className="bg-blue-600 text-white text-[8px]">
                                  {item.key}
                                </Badge>
                              </div>
                            </>
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-muted/30">
                              <p className="text-[10px] text-red-500">⚠️ Falta</p>
                            </div>
                          )}
                          <div className="absolute top-1 left-1">
                            <Badge className={`${item.color} text-card text-[10px] px-2 py-1`}>
                              {item.ageRange}
                            </Badge>
                          </div>
                        </div>
                        <div className={`p-3 ${index % 2 === 1 ? "order-1" : "order-2"}`}>
                          <p className="text-xs font-semibold text-foreground mb-1">
                            {item.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Vista previa de la categoria con indicadores y logros.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
