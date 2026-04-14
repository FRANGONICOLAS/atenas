import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Json } from "@/api/types";
import type { TechnicalTacticalData } from "@/types/beneficiary.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface TechnicalTecticalFormProps {
  data?: Json;
  onChange: (data: Json) => void;
}

type SurfaceOption = "Interno" | "Externo" | "Empeine" | "Puntera" | "Planta";

type ZoneOption = "Área chica" | "Área grande" | "Fuera del área";

type TechnicalSectionData = Record<string, unknown>;

const PASS_SURFACE_OPTIONS: SurfaceOption[] = [
  "Interno",
  "Externo",
  "Empeine",
  "Puntera",
];

const CONDUCTION_SURFACE_OPTIONS: SurfaceOption[] = [
  "Interno",
  "Externo",
  "Empeine",
  "Planta",
];

const SHOT_TYPE_OPTIONS = [
  "Estático",
  "En carrera",
  "Tras control",
  "De cabeza",
  "De volea",
];

const SHOT_ZONE_OPTIONS: ZoneOption[] = ["Área chica", "Área grande", "Fuera del área"];

// Función para obtener el color según la calificación
const getRatingColor = (rating: number): string => {
  if (rating === 5) return "text-green-600";
  if (rating === 4) return "text-blue-600";
  if (rating === 3) return "text-yellow-600";
  if (rating === 2) return "text-orange-600";
  return "text-red-600";
};

// Función para obtener el texto de la calificación
const getRatingText = (rating: number): string => {
  const ratings: { [key: number]: string } = {
    1: "Por mejorar",
    2: "Regular",
    3: "Bueno",
    4: "Muy bueno",
    5: "Excelente"
  };
  return ratings[rating] || "Sin calificar";
};

export const TechnicalTecticalForm = ({
  data,
  onChange,
}: TechnicalTecticalFormProps) => {
  const technicalData = (data as TechnicalTacticalData) || {};

  const getSection = (section: string): TechnicalSectionData => {
    const value = (technicalData as Record<string, unknown>)[section];
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return {};
    }
    return value as TechnicalSectionData;
  };

  const updateSection = (section: string, sectionData: TechnicalSectionData) => {
    onChange({
      ...technicalData,
      [section]: sectionData,
    } as Json);
  };

  const handleSectionFieldChange = (
    section: string,
    field: string,
    value: number | string | string[],
  ) => {
    const currentSection = getSection(section);
    updateSection(section, {
      ...currentSection,
      [field]: value,
    });
  };

  const handleMultiSelectToggle = (
    section: string,
    field: string,
    option: string,
    checked: boolean,
  ) => {
    const currentSection = getSection(section);
    const currentRaw = currentSection[field];
    const current = Array.isArray(currentRaw)
      ? currentRaw.filter((item): item is string => typeof item === "string")
      : [];

    const next = checked
      ? Array.from(new Set([...current, option]))
      : current.filter((item) => item !== option);

    updateSection(section, {
      ...currentSection,
      [field]: next,
    });
  };

  const extractNumericValues = (obj: unknown): number[] => {
    if (!obj || typeof obj !== "object") return [];

    return Object.values(obj as Record<string, unknown>).filter(
      (value): value is number =>
        typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 5,
    );
  };

  const averageScores = (() => {
    const allScores = [
      ...extractNumericValues(getSection("pase")),
      ...extractNumericValues(getSection("recepcion")),
      ...extractNumericValues(getSection("remate")),
      ...extractNumericValues(getSection("conduccion")),
    ];

    if (allScores.length === 0) return null;
    const avg = allScores.reduce((sum, value) => sum + value, 0) / allScores.length;
    return Number(avg.toFixed(1));
  })();

  const SkillSlider = ({
    label,
    section,
    field,
    value,
  }: {
    label: string;
    section: string;
    field: string;
    value?: number;
  }) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="font-medium">{label}</Label>
        <span className={cn(
          "text-sm font-semibold px-3 py-1 rounded-full",
          getRatingColor(value || 1),
        )}>
          {value || 1} - {getRatingText(value || 1)}
        </span>
      </div>
      <div className="space-y-2">
        <Slider
          value={[value || 1]}
          onValueChange={(vals) => handleSectionFieldChange(section, field, vals[0])}
          min={1}
          max={5}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
      </div>
    </div>
  );

  const MultiSelectCheckboxes = ({
    section,
    field,
    options,
    value,
  }: {
    section: string;
    field: string;
    options: string[];
    value: string[];
  }) => (
    <div className="grid grid-cols-2 gap-3">
      {options.map((option) => {
        const checked = value.includes(option);
        return (
          <div key={option} className="flex items-center gap-2">
            <Checkbox
              id={`${section}-${field}-${option}`}
              checked={checked}
              onCheckedChange={(state) =>
                handleMultiSelectToggle(section, field, option, state === true)
              }
            />
            <Label htmlFor={`${section}-${field}-${option}`} className="font-normal cursor-pointer">
              {option}
            </Label>
          </div>
        );
      })}
    </div>
  );

  const SingleChoiceCheckboxes = ({
    section,
    field,
    options,
    value,
  }: {
    section: string;
    field: string;
    options: ZoneOption[];
    value?: string;
  }) => (
    <div className="space-y-2">
      {options.map((option) => {
        const checked = value === option;
        return (
          <div key={option} className="flex items-center gap-2">
            <Checkbox
              id={`${section}-${field}-${option}`}
              checked={checked}
              onCheckedChange={(state) =>
                handleSectionFieldChange(section, field, state === true ? option : "")
              }
            />
            <Label htmlFor={`${section}-${field}-${option}`} className="font-normal cursor-pointer">
              {option}
            </Label>
          </div>
        );
      })}
    </div>
  );

  const passSection = getSection("pase");
  const receptionSection = getSection("recepcion");
  const shotSection = getSection("remate");
  const conductionSection = getSection("conduccion");

  const passSurfaces = Array.isArray(passSection.tipo_superficie_utilizada)
    ? (passSection.tipo_superficie_utilizada as string[])
    : [];

  const receptionSurfaces = Array.isArray(receptionSection.tipo_superficie_utilizada)
    ? (receptionSection.tipo_superficie_utilizada as string[])
    : [];

  const shotTypes = Array.isArray(shotSection.tipo_remate_evaluado)
    ? (shotSection.tipo_remate_evaluado as string[])
    : [];

  const conductionSurfaces = Array.isArray(conductionSection.superficie_pie_utilizada)
    ? (conductionSection.superficie_pie_utilizada as string[])
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Evaluación Técnico-Táctica
        </CardTitle>
        <CardDescription>
          Evalúa pase, recepción, remate y conducción en escala de 1 a 5.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Escala de referencia */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2 text-sm">Escala de Calificación:</h4>
          <div className="grid grid-cols-5 gap-2 text-xs">
            <div className="text-center">
              <div className="font-semibold text-red-600">1</div>
              <div>Por mejorar</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-orange-600">2</div>
              <div>Regular</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-yellow-600">3</div>
              <div>Bueno</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-600">4</div>
              <div>Muy bueno</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">5</div>
              <div>Excelente</div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4 rounded-lg border p-4">
            <h4 className="font-semibold">Sección técnica del pase</h4>
            <SkillSlider section="pase" label="Precisión del pase corto" field="precision_pase_corto" value={passSection.precision_pase_corto as number | undefined} />
            <SkillSlider section="pase" label="Precisión del pase largo" field="precision_pase_largo" value={passSection.precision_pase_largo as number | undefined} />
            <SkillSlider section="pase" label="Uso del perfil débil en el pase" field="uso_perfil_debil_pase" value={passSection.uso_perfil_debil_pase as number | undefined} />
            <SkillSlider section="pase" label="Pase en movimiento" field="pase_en_movimiento" value={passSection.pase_en_movimiento as number | undefined} />

            <div className="space-y-2">
              <Label className="font-medium">Tipo de superficie utilizada</Label>
              <MultiSelectCheckboxes
                section="pase"
                field="tipo_superficie_utilizada"
                options={PASS_SURFACE_OPTIONS}
                value={passSurfaces}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones_pase">Observaciones del pase</Label>
              <Textarea
                id="observaciones_pase"
                value={(passSection.observaciones_pase as string) || ""}
                onChange={(e) => handleSectionFieldChange("pase", "observaciones_pase", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <h4 className="font-semibold">Sección técnica de la recepción</h4>
            <SkillSlider section="recepcion" label="Precisión del pase corto" field="precision_pase_corto" value={receptionSection.precision_pase_corto as number | undefined} />
            <SkillSlider section="recepcion" label="Precisión del pase largo" field="precision_pase_largo" value={receptionSection.precision_pase_largo as number | undefined} />
            <SkillSlider section="recepcion" label="Uso del perfil débil en el pase" field="uso_perfil_debil_pase" value={receptionSection.uso_perfil_debil_pase as number | undefined} />
            <SkillSlider section="recepcion" label="Pase en movimiento" field="pase_en_movimiento" value={receptionSection.pase_en_movimiento as number | undefined} />

            <div className="space-y-2">
              <Label className="font-medium">Tipo de superficie utilizada</Label>
              <MultiSelectCheckboxes
                section="recepcion"
                field="tipo_superficie_utilizada"
                options={PASS_SURFACE_OPTIONS}
                value={receptionSurfaces}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones_recepcion">Observaciones de la recepción</Label>
              <Textarea
                id="observaciones_recepcion"
                value={(receptionSection.observaciones_recepcion as string) || ""}
                onChange={(e) => handleSectionFieldChange("recepcion", "observaciones_recepcion", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <h4 className="font-semibold">Sección técnica del remate</h4>
            <SkillSlider section="remate" label="Potencia del remate" field="potencia_remate" value={shotSection.potencia_remate as number | undefined} />
            <SkillSlider section="remate" label="Precisión del remate" field="precision_remate" value={shotSection.precision_remate as number | undefined} />
            <SkillSlider section="remate" label="Remate con perfil débil" field="remate_perfil_debil" value={shotSection.remate_perfil_debil as number | undefined} />
            <SkillSlider section="remate" label="Remate de cabeza" field="remate_cabeza" value={shotSection.remate_cabeza as number | undefined} />
            <SkillSlider section="remate" label="Remate en movimiento" field="remate_en_movimiento" value={shotSection.remate_en_movimiento as number | undefined} />

            <div className="space-y-2">
              <Label className="font-medium">Tipo de remate evaluado</Label>
              <MultiSelectCheckboxes
                section="remate"
                field="tipo_remate_evaluado"
                options={SHOT_TYPE_OPTIONS}
                value={shotTypes}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-medium">Zona de remate</Label>
              <SingleChoiceCheckboxes
                section="remate"
                field="zona_remate"
                options={SHOT_ZONE_OPTIONS}
                value={shotSection.zona_remate as string | undefined}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones_remate">Observaciones del remate</Label>
              <Textarea
                id="observaciones_remate"
                value={(shotSection.observaciones_remate as string) || ""}
                onChange={(e) => handleSectionFieldChange("remate", "observaciones_remate", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <h4 className="font-semibold">Sección técnica de conducción</h4>
            <SkillSlider section="conduccion" label="Control del balón en conducción" field="control_balon_conduccion" value={conductionSection.control_balon_conduccion as number | undefined} />
            <SkillSlider section="conduccion" label="Conducción con perfil débil" field="conduccion_perfil_debil" value={conductionSection.conduccion_perfil_debil as number | undefined} />
            <SkillSlider section="conduccion" label="Velocidad de conducción" field="velocidad_conduccion" value={conductionSection.velocidad_conduccion as number | undefined} />
            <SkillSlider section="conduccion" label="Cambios de dirección" field="cambios_direccion" value={conductionSection.cambios_direccion as number | undefined} />
            <SkillSlider section="conduccion" label="Visión periférica durante la conducción" field="vision_periferica" value={conductionSection.vision_periferica as number | undefined} />
            <SkillSlider section="conduccion" label="Conducción bajo presión" field="conduccion_bajo_presion" value={conductionSection.conduccion_bajo_presion as number | undefined} />

            <div className="space-y-2">
              <Label className="font-medium">Superficie del pie utilizada</Label>
              <MultiSelectCheckboxes
                section="conduccion"
                field="superficie_pie_utilizada"
                options={CONDUCTION_SURFACE_OPTIONS}
                value={conductionSurfaces}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones_conduccion">Observaciones de la conducción</Label>
              <Textarea
                id="observaciones_conduccion"
                value={(conductionSection.observaciones_conduccion as string) || ""}
                onChange={(e) => handleSectionFieldChange("conduccion", "observaciones_conduccion", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Promedio general */}
        {averageScores !== null && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-blue-900">Promedio General:</span>
              <span className={cn(
                "text-lg font-bold px-4 py-1 rounded-full",
                getRatingColor(Math.round(averageScores))
              )}>
                {averageScores.toFixed(1)} - {getRatingText(Math.round(averageScores))}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
