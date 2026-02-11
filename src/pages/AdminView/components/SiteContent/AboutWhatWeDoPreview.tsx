import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SiteContent, SiteContentFormData } from "@/types";

interface AboutWhatWeDoPreviewProps {
  contents: SiteContent[];
  handleOpenEdit: (content: SiteContent) => void;
  setIsCreating: (value: boolean) => void;
  setFile: (value: File | null) => void;
  setPreviewUrl: (value: string | null) => void;
  setFormData: (value: SiteContentFormData) => void;
  setShowDialog: (value: boolean) => void;
  setEditingContent: (value: SiteContent | null) => void;
}

export const AboutWhatWeDoPreview = ({
  contents,
  handleOpenEdit,
  setIsCreating,
  setFile,
  setPreviewUrl,
  setFormData,
  setShowDialog,
  setEditingContent,
}: AboutWhatWeDoPreviewProps) => {
  const createContent = (contentKey: string, title: string, category: string) => {
    setEditingContent(null);
    setIsCreating(true);
    setFile(null);
    setPreviewUrl(null);
    setFormData({
      content_key: contentKey,
      title,
      description: "",
      page_section: "about",
      content_type: "image",
      category,
      video_url: "",
    });
    setShowDialog(true);
  };

  const getContent = (contentKey: string) =>
    contents.find((content) => content.content_key === contentKey && content.is_active);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Vista Previa: Quienes Somos + Que Hacemos</CardTitle>
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
            height: "650px",
            overflowY: "auto",
          }}
        >
          <div className="space-y-0">
            {/* Quienes Somos - Hero */}
            {(() => {
              const hero = getContent("about_hero");
              return (
                <div
                  className="relative h-40 flex items-center justify-center overflow-hidden cursor-pointer group bg-primary"
                  onClick={() => (hero ? handleOpenEdit(hero) : createContent("about_hero", "Hero Quienes Somos", "hero"))}
                >
                  {hero ? (
                    <>
                      <img
                        src={hero.public_url}
                        alt="Hero Quienes Somos"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-primary/70" />
                    </>
                  ) : (
                    <div className="text-center">
                      <p className="text-red-500 font-semibold mb-2">⚠️ FALTA: about_hero</p>
                      <Button size="sm" variant="outline">
                        Crear Imagen
                      </Button>
                    </div>
                  )}
                  <div className="relative z-10 text-center text-primary-foreground px-4">
                    <h2 className="text-xl font-bold">Quienes Somos</h2>
                    <p className="text-xs opacity-80">Mision, vision y valores</p>
                  </div>
                  {hero && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Badge className="bg-blue-600 text-white">about_hero</Badge>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Quienes Somos - Equipo */}
            <div className="bg-background py-6 px-4">
              <h3 className="text-base font-bold text-center mb-3">Estructura Organizacional</h3>
              <div className="grid grid-cols-4 gap-2 max-w-3xl mx-auto">
                {[
                  { key: "about_team_1", title: "Integrante 1" },
                  { key: "about_team_2", title: "Integrante 2" },
                  { key: "about_team_3", title: "Integrante 3" },
                  { key: "about_team_4", title: "Integrante 4" },
                ].map(({ key, title }) => {
                  const member = getContent(key);
                  return (
                    <div
                      key={key}
                      className="relative h-24 rounded overflow-hidden cursor-pointer group"
                      onClick={() =>
                        member ? handleOpenEdit(member) : createContent(key, title, "team")
                      }
                    >
                      {member ? (
                        <>
                          <img
                            src={member.public_url}
                            alt={title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Badge className="bg-blue-600 text-white text-[8px]">
                              {key}
                            </Badge>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <p className="text-[10px] text-red-500">⚠️ Falta</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Que Hacemos - Actividades */}
            <div className="bg-muted/30 py-6 px-4">
              <h3 className="text-base font-bold text-center mb-3">Que Hacemos</h3>
              <div className="grid grid-cols-2 gap-3 max-w-3xl mx-auto">
                {[
                  { key: "what_we_do_activity_1", title: "Actividad 1" },
                  { key: "what_we_do_activity_2", title: "Actividad 2" },
                  { key: "what_we_do_activity_3", title: "Actividad 3" },
                  { key: "what_we_do_activity_4", title: "Actividad 4" },
                ].map(({ key, title }) => {
                  const activity = getContent(key);
                  return (
                    <div
                      key={key}
                      className="relative h-24 rounded overflow-hidden cursor-pointer group"
                      onClick={() =>
                        activity ? handleOpenEdit(activity) : createContent(key, title, "activity")
                      }
                    >
                      {activity ? (
                        <>
                          <img
                            src={activity.public_url}
                            alt={title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Badge className="bg-blue-600 text-white text-[8px]">
                              {key}
                            </Badge>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-background flex items-center justify-center">
                          <p className="text-[10px] text-red-500">⚠️ Falta</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Que Hacemos - Imagen principal */}
            {(() => {
              const mainImage = getContent("what_we_do_main");
              return (
                <div className="bg-background py-6 px-4">
                  <h3 className="text-base font-bold text-center mb-3">Imagen Principal</h3>
                  <div
                    className="relative h-32 rounded overflow-hidden cursor-pointer group max-w-3xl mx-auto"
                    onClick={() =>
                      mainImage
                        ? handleOpenEdit(mainImage)
                        : createContent("what_we_do_main", "Imagen Principal", "main")
                    }
                  >
                    {mainImage ? (
                      <>
                        <img
                          src={mainImage.public_url}
                          alt="Imagen Principal"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Badge className="bg-blue-600 text-white text-[8px]">
                            what_we_do_main
                          </Badge>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <p className="text-xs text-red-500">⚠️ Falta</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Que Hacemos - Impacto comunitario */}
            <div className="bg-muted/20 py-6 px-4">
              <h3 className="text-base font-bold text-center mb-3">Impacto Comunitario</h3>
              <div className="grid grid-cols-2 gap-3 max-w-3xl mx-auto">
                {[
                  { key: "what_we_do_community_1", title: "Impacto 1" },
                  { key: "what_we_do_community_2", title: "Impacto 2" },
                ].map(({ key, title }) => {
                  const impact = getContent(key);
                  return (
                    <div
                      key={key}
                      className="relative h-24 rounded overflow-hidden cursor-pointer group"
                      onClick={() =>
                        impact ? handleOpenEdit(impact) : createContent(key, title, "community")
                      }
                    >
                      {impact ? (
                        <>
                          <img
                            src={impact.public_url}
                            alt={title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Badge className="bg-blue-600 text-white text-[8px]">
                              {key}
                            </Badge>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-background flex items-center justify-center">
                          <p className="text-[10px] text-red-500">⚠️ Falta</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Enlaces rapidos */}
            <div className="bg-primary py-4 px-4 text-center text-primary-foreground text-xs">
              CTA y contenido textual se mantienen como en las paginas publicas
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
