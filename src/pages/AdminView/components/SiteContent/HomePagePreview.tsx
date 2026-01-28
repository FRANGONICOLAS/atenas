import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SiteContent, SiteContentFormData } from "@/types";

interface HomePagePreviewProps {
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

export const HomePagePreview = ({
  contents,
  handleOpenEdit,
  handleOpenCreate,
  setIsCreating,
  setFile,
  setPreviewUrl,
  setFormData,
  setShowDialog,
  setEditingContent,
}: HomePagePreviewProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Vista Previa: Página de Inicio</CardTitle>
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
            height: "600px",
            overflowY: "auto",
          }}
        >
          <div className="space-y-0">
            {/* Hero Section Miniatura */}
            {(() => {
              const hero = contents.find(
                (c) => c.content_key === "home_hero" && c.is_active,
              );
              return (
                <div
                  className="relative h-48 flex items-center justify-center overflow-hidden cursor-pointer group"
                  onClick={() =>
                    hero ? handleOpenEdit(hero) : handleOpenCreate()
                  }
                >
                  {hero ? (
                    <>
                      <img
                        src={hero.public_url}
                        alt="Hero"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
                      <div className="relative z-10 text-white text-center px-4">
                        <h1 className="text-2xl font-bold mb-2">
                          Transformando Vidas a Través del Deporte
                        </h1>
                        <p className="text-sm opacity-80 mb-3">
                          Brindando oportunidades a jóvenes en situación de
                          vulnerabilidad
                        </p>
                        <div className="flex gap-2 justify-center">
                          <div className="px-3 py-1 bg-primary rounded text-xs">
                            Donar Ahora
                          </div>
                          <div className="px-3 py-1 bg-white/20 rounded text-xs">
                            Conocer Más
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Badge className="bg-blue-600 text-white">
                          home_hero
                        </Badge>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <p className="text-red-500 font-semibold mb-2">
                        ⚠️ FALTA: home_hero
                      </p>
                      <Button size="sm" variant="outline">
                        Crear Imagen
                      </Button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Sección Problemática */}
            <div className="bg-slate-900 py-8 px-4">
              <h2 className="text-lg font-bold text-white text-center mb-3">
                La Realidad que Enfrentamos
              </h2>
              <p className="text-xs text-white/70 text-center max-w-md mx-auto mb-4">
                Muchos jóvenes viven en contextos de vulnerabilidad...
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
                {[
                  { idx: 1, key: "home_problem", title: "Problemática" },
                  { idx: 2, key: "home_impact", title: "Nuestro Impacto" },
                ].map(({ idx, key, title }) => {
                  const impact = contents.find(
                    (c) => c.content_key === key && c.is_active,
                  );
                  return (
                    <div
                      key={idx}
                      className="relative h-24 rounded overflow-hidden cursor-pointer group"
                      onClick={() => {
                        if (impact) {
                          handleOpenEdit(impact);
                        } else {
                          setEditingContent(null);
                          setIsCreating(true);
                          setFile(null);
                          setPreviewUrl(null);
                          setFormData({
                            content_key: key,
                            title: title,
                            description: "",
                            page_section: "home",
                            content_type: "image",
                            category: "",
                            video_url: "",
                          });
                          setShowDialog(true);
                        }
                      }}
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
                        <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                          <p className="text-xs text-red-400">⚠️ Falta</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sección Transformación */}
            <div className="bg-white py-8 px-4">
              <h2 className="text-lg font-bold text-center mb-2">
                Cómo el Deporte Transforma Vidas
              </h2>
              <p className="text-xs text-gray-600 text-center mb-4">
                El deporte genera sentido de pertenencia, disciplina y salud
                mental
              </p>
              <div className="grid grid-cols-3 gap-2 max-w-2xl mx-auto">
                {[
                  { num: 1, title: "Sentido de Pertenencia" },
                  { num: 2, title: "Manejo de Emociones" },
                  { num: 3, title: "Salud Física" },
                  { num: 4, title: "Disciplina" },
                  { num: 5, title: "Trabajo en Equipo" },
                  { num: 6, title: "Oportunidades" },
                ].map(({ num, title }) => {
                  const key = `home_transformation_${num}`;
                  const transformation = contents.find(
                    (c) => c.content_key === key && c.is_active,
                  );
                  return (
                    <div
                      key={key}
                      className="border rounded overflow-hidden cursor-pointer group"
                      onClick={() =>
                        transformation
                          ? handleOpenEdit(transformation)
                          : handleOpenCreate()
                      }
                    >
                      <div className="relative h-20">
                        {transformation ? (
                          <>
                            <img
                              src={transformation.public_url}
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
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <p className="text-[10px] text-red-500">
                              ⚠️ #{num}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="p-1 bg-white">
                        <p className="text-[10px] font-semibold text-center truncate">
                          {title}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sección Donaciones */}
            <div className="bg-gray-50 py-8 px-4">
              <h2 className="text-lg font-bold text-center mb-2">
                ¿Qué Hacemos con tu Donación?
              </h2>
              <p className="text-xs text-gray-600 text-center mb-4">
                Las donaciones transforman vidas a través del deporte
              </p>
              <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
                {[
                  { idx: 1, title: "Equipo Deportivo" },
                  { idx: 2, title: "Torneos" },
                  { idx: 3, title: "Proyectos Definidos" },
                ].map(({ idx, title }) => {
                  const projects = contents.find(
                    (c) => c.content_key === "home_projects" && c.is_active,
                  );
                  return (
                    <div
                      key={idx}
                      className="border rounded overflow-hidden cursor-pointer group"
                      onClick={() =>
                        projects ? handleOpenEdit(projects) : handleOpenCreate()
                      }
                    >
                      <div className="relative h-24">
                        {projects ? (
                          <>
                            <img
                              src={projects.public_url}
                              alt={title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Badge className="bg-blue-600 text-white text-[8px]">
                                home_projects
                              </Badge>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <p className="text-xs text-red-500">⚠️ Falta</p>
                          </div>
                        )}
                      </div>
                      <div className="p-2 bg-white">
                        <p className="text-xs font-semibold text-center">
                          {title}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sección CTA */}
            <div className="relative py-8 px-4 overflow-hidden">
              {(() => {
                const cta = contents.find(
                  (c) => c.content_key === "home_cta" && c.is_active,
                );
                return (
                  <div
                    className="relative h-32 flex items-center justify-center cursor-pointer group rounded"
                    onClick={() =>
                      cta ? handleOpenEdit(cta) : handleOpenCreate()
                    }
                  >
                    {cta ? (
                      <>
                        <img
                          src={cta.public_url}
                          alt="CTA Background"
                          className="absolute inset-0 w-full h-full object-cover rounded"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/90 to-secondary/80 rounded" />
                        <div className="relative z-10 text-center px-4">
                          <h2 className="text-xl font-bold text-secondary-foreground mb-2">
                            ¿Quieres ser parte del cambio?
                          </h2>
                          <p className="text-xs text-secondary-foreground/80 mb-3">
                            Tu donación puede transformar vidas
                          </p>
                          <div className="px-3 py-1 bg-foreground text-primary-foreground rounded text-xs inline-block">
                            Donar Ahora
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Badge className="bg-blue-600 text-white">
                            home_cta
                          </Badge>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-secondary/20 flex items-center justify-center rounded">
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <p className="text-xs text-red-500">⚠️ Falta - Sección llamado a la acción</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
