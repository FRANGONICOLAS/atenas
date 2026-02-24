import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Json } from "@/api/types";
import type { EmotionalData } from "@/types/beneficiary.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain } from "lucide-react";

interface EmotionalFormProps {
  data?: Json;
  onChange: (data: Json) => void;
}

export const EmotionalForm = ({
  data,
  onChange,
}: EmotionalFormProps) => {
  const emotionalData = (data as EmotionalData) || {};

  const handleChange = (field: string, value: number | string) => {
    onChange({
      ...emotionalData,
      [field]: value,
    } as Json);
  };

  const QuestionWithOptions = ({
    label,
    field,
    value,
    options,
  }: {
    label: string;
    field: string;
    value: string;
    options: Array<{ value: string; label: string }>;
  }) => (
    <div className="space-y-3 p-4 border rounded-lg">
      <Label className="text-base font-medium">{label}</Label>
      <RadioGroup
        value={value || ""}
        onValueChange={(val) => handleChange(field, val)}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={`${field}-${option.value}`} />
            <Label
              htmlFor={`${field}-${option.value}`}
              className="font-normal cursor-pointer"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );

  const frequencyOptions = [
    { value: "nunca", label: "Nunca" },
    { value: "algunas_veces", label: "Algunas veces" },
    { value: "frecuentemente", label: "Frecuentemente" },
  ];

  const supportOptions = [
    { value: "si", label: "Sí" },
    { value: "mas_o_menos", label: "Más o menos" },
    { value: "no", label: "No" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Evaluación Psicológica/Emocional
        </CardTitle>
        <CardDescription>
          Marca o responde lo que mejor describa cómo se ha sentido el jugador en la última semana
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <QuestionWithOptions
          label="¿Se ha sentido desmotivado con el fútbol o el entrenamiento?"
          field="triste_desanimado"
          value={emotionalData.triste_desanimado || ""}
          options={frequencyOptions}
        />

        <QuestionWithOptions
          label="¿Ha tenido dificultades para concentrarse durante los entrenamientos o partidos?"
          field="dificultad_concentracion"
          value={emotionalData.dificultad_concentracion || ""}
          options={frequencyOptions}
        />

        <QuestionWithOptions
          label="¿Se siente nervioso o presionado antes de los partidos?"
          field="estres_ansiedad"
          value={emotionalData.estres_ansiedad || ""}
          options={frequencyOptions}
        />

        <QuestionWithOptions
          label="¿Ha tenido problemas para dormir antes de partidos importantes?"
          field="problemas_sueno"
          value={emotionalData.problemas_sueno || ""}
          options={frequencyOptions}
        />

        <QuestionWithOptions
          label="¿Se ha sentido sin energía o muy cansado para entrenar?"
          field="poca_energia"
          value={emotionalData.poca_energia || ""}
          options={frequencyOptions}
        />

        <QuestionWithOptions
          label="¿Se lleva bien con sus compañeros de equipo?"
          field="apoyo_social"
          value={emotionalData.apoyo_social || ""}
          options={supportOptions}
        />

        <div className="space-y-2 pt-4">
          <Label htmlFor="observaciones_psico">Observaciones Adicionales</Label>
          <Textarea
            id="observaciones_psico"
            value={emotionalData.observaciones || ""}
            onChange={(e) => handleChange("observaciones", e.target.value)}
            placeholder="Notas sobre comportamiento, emociones, situación familiar, etc..."
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
};
