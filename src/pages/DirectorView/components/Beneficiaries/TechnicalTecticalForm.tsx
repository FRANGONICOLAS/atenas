import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Json } from "@/api/types";
import type { TechnicalTacticalData } from "@/types/beneficiary.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface TechnicalTecticalFormProps {
  data?: Json;
  onChange: (data: Json) => void;
}

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

  const handleChange = (field: string, value: any) => {
    onChange({
      ...technicalData,
      [field]: value,
    });
  };

  const SkillSlider = ({
    label,
    field,
    value,
  }: {
    label: string;
    field: string;
    value: number;
  }) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="font-medium">{label}</Label>
        <span className={cn(
          "text-sm font-semibold px-3 py-1 rounded-full",
          getRatingColor(value || 1)
        )}>
          {value || 1} - {getRatingText(value || 1)}
        </span>
      </div>
      <div className="space-y-2">
        <Slider
          value={[value || 1]}
          onValueChange={(vals) => handleChange(field, vals[0])}
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Evaluación Técnico-Táctica
        </CardTitle>
        <CardDescription>
          Evalúa las habilidades técnicas y tácticas del beneficiario (escala 1-5)
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

        {/* Habilidades técnicas */}
        <div className="space-y-6">
          <SkillSlider
            label="Pase"
            field="pase"
            value={technicalData.pase || 1}
          />
          
          <SkillSlider
            label="Recepción"
            field="recepcion"
            value={technicalData.recepcion || 1}
          />
          
          <SkillSlider
            label="Remate"
            field="remate"
            value={technicalData.remate || 1}
          />
          
          <SkillSlider
            label="Regate"
            field="regate"
            value={technicalData.regate || 1}
          />
          
          <SkillSlider
            label="Ubicación de Espacio Temporal"
            field="ubicacion_espacio_temporal"
            value={technicalData.ubicacion_espacio_temporal || 1}
          />
        </div>

        {/* Promedio general */}
        {Object.keys(technicalData).some(key => 
          ['pase', 'recepcion', 'remate', 'regate', 'ubicacion_espacio_temporal'].includes(key)
        ) && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-blue-900">Promedio General:</span>
              <span className={cn(
                "text-lg font-bold px-4 py-1 rounded-full",
                getRatingColor(Math.round((
                  (technicalData.pase || 0) +
                  (technicalData.recepcion || 0) +
                  (technicalData.remate || 0) +
                  (technicalData.regate || 0) +
                  (technicalData.ubicacion_espacio_temporal || 0)
                ) / 5))
              )}>
                {((
                  (technicalData.pase || 0) +
                  (technicalData.recepcion || 0) +
                  (technicalData.remate || 0) +
                  (technicalData.regate || 0) +
                  (technicalData.ubicacion_espacio_temporal || 0)
                ) / 5).toFixed(1)} - {getRatingText(Math.round((
                  (technicalData.pase || 0) +
                  (technicalData.recepcion || 0) +
                  (technicalData.remate || 0) +
                  (technicalData.regate || 0) +
                  (technicalData.ubicacion_espacio_temporal || 0)
                ) / 5))}
              </span>
            </div>
          </div>
        )}

        {/* Observaciones */}
        <div className="space-y-2">
          <Label htmlFor="observaciones_tecnicas">Observaciones Técnico-Tácticas</Label>
          <Textarea
            id="observaciones_tecnicas"
            value={technicalData.observaciones || ""}
            onChange={(e) => handleChange("observaciones", e.target.value)}
            placeholder="Notas adicionales sobre el desempeño técnico-táctico del beneficiario..."
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
};
