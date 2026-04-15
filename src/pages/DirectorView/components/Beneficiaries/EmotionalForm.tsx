import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Json } from "@/api/types";
import type { EmotionalData } from "@/types/beneficiary.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain } from "lucide-react";

interface EmotionalFormProps {
  data?: Json;
  onChange: (data: Json) => void;
}

const fantasticQuestions = [
  {
    block: "F - Familia y Amigos",
    field: "fantastic_1",
    label:
      "¿Tengo una relación cercana y de confianza con mis padres o cuidadores?",
    reversed: false,
  },
  {
    block: "F - Familia y Amigos",
    field: "fantastic_2",
    label:
      "¿Cuento con amigos o compañeros de equipo con quienes hablar de mis problemas?",
    reversed: false,
  },
  {
    block: "F - Familia y Amigos",
    field: "fantastic_3",
    label: "¿Me siento querido y valorado en mi entorno familiar?",
    reversed: false,
  },
  {
    block: "F - Familia y Amigos",
    field: "fantastic_4",
    label:
      "¿Recibo apoyo de mi familia para asistir a mis entrenamientos de fútbol?",
    reversed: false,
  },
  {
    block: "F - Familia y Amigos",
    field: "fantastic_5",
    label: "¿Soy capaz de dar y recibir afecto de manera natural?",
    reversed: false,
  },
  {
    block: "A - Actividad Física",
    field: "fantastic_6",
    label:
      "¿Realizo actividad física intensa (entrenamientos) más de 3 veces por semana?",
    reversed: false,
  },
  {
    block: "A - Actividad Física",
    field: "fantastic_7",
    label:
      "¿Me mantengo activo durante el día (camino, subo escaleras, juego en el parque)?",
    reversed: false,
  },
  {
    block: "A - Actividad Física",
    field: "fantastic_8",
    label:
      "¿Realizo ejercicios de estiramiento o movilidad antes y después de jugar?",
    reversed: false,
  },
  {
    block: "A - Actividad Física",
    field: "fantastic_9",
    label:
      "¿Participo con entusiasmo en las actividades grupales de la fundación?",
    reversed: false,
  },
  {
    block: "A - Actividad Física",
    field: "fantastic_10",
    label:
      "¿Prefiero las actividades al aire libre sobre los videojuegos o estar sentado?",
    reversed: false,
  },
  {
    block: "N - Nutrición",
    field: "fantastic_11",
    label: "¿Desayuno todos los días antes de ir a estudiar o entrenar?",
    reversed: false,
  },
  {
    block: "N - Nutrición",
    field: "fantastic_12",
    label: "¿Consumo al menos 2 porciones de fruta y 3 de verduras al día?",
    reversed: false,
  },
  {
    block: "N - Nutrición",
    field: "fantastic_13",
    label: "¿Bebo suficiente agua durante el día (más de 1.5 litros)?",
    reversed: false,
  },
  {
    block: "N - Nutrición",
    field: "fantastic_14",
    label:
      "¿Evito el consumo de bebidas azucaradas (gaseosas, jugos artificiales)?",
    reversed: false,
  },
  {
    block: "N - Nutrición",
    field: "fantastic_15",
    label: "¿Evito comer comida chatarra o fritos más de 2 veces por semana?",
    reversed: false,
  },
  {
    block: "T - Tabaco y Tóxicos",
    field: "fantastic_16",
    label: "¿Evito fumar cigarrillos o usar vapeadores?",
    reversed: false,
  },
  {
    block: "T - Tabaco y Tóxicos",
    field: "fantastic_17",
    label: "¿Me alejo de lugares donde la gente está fumando?",
    reversed: false,
  },
  {
    block: "T - Tabaco y Tóxicos",
    field: "fantastic_18",
    label: "¿Soy consciente de que el tabaco daña mis pulmones para el fútbol?",
    reversed: false,
  },
  {
    block: "T - Tabaco y Tóxicos",
    field: "fantastic_19",
    label: "¿Evito el consumo de sustancias psicoactivas (drogas)?",
    reversed: false,
  },
  {
    block: "T - Tabaco y Tóxicos",
    field: "fantastic_20",
    label:
      "¿Mis amigos cercanos son personas que no consumen sustancias tóxicas?",
    reversed: false,
  },
  {
    block: "A - Alcohol",
    field: "fantastic_21",
    label: "¿Me mantengo alejado del consumo de alcohol?",
    reversed: false,
  },
  {
    block: "A - Alcohol",
    field: "fantastic_22",
    label:
      "¿Entiendo que el alcohol afecta mi crecimiento y recuperación muscular?",
    reversed: false,
  },
  {
    block: "A - Alcohol",
    field: "fantastic_23",
    label:
      "¿Evito asistir a reuniones donde el centro sea el consumo de alcohol?",
    reversed: false,
  },
  {
    block: "A - Alcohol",
    field: "fantastic_24",
    label:
      '¿Me siento capaz de decir "no" si alguien me ofrece una bebida alcohólica?',
    reversed: false,
  },
  {
    block: "A - Alcohol",
    field: "fantastic_25",
    label: "¿Conozco los riesgos de las bebidas embriagantes para mi salud?",
    reversed: false,
  },
  {
    block: "S - Sueño y Estrés",
    field: "fantastic_26",
    label: "¿Duermo entre 8 y 10 horas seguidas cada noche?",
    reversed: false,
  },
  {
    block: "S - Sueño y Estrés",
    field: "fantastic_27",
    label: "¿Me despierto sintiéndome descansado y con energía para entrenar?",
    reversed: false,
  },
  {
    block: "S - Sueño y Estrés",
    field: "fantastic_28",
    label:
      "¿Soy capaz de relajarme después de un día de mucho estudio o ejercicio?",
    reversed: false,
  },
  {
    block: "S - Sueño y Estrés",
    field: "fantastic_29",
    label: "¿Hablo con alguien cuando me siento bajo mucha presión?",
    reversed: false,
  },
  {
    block: "S - Sueño y Estrés",
    field: "fantastic_30",
    label: "¿Evito usar pantallas (celular/TV) una hora antes de ir a dormir?",
    reversed: false,
  },
  {
    block: "T - Trabajo (Estudio) y Tipo de Personalidad",
    field: "fantastic_31",
    label: "¿Me siento satisfecho con mi desempeño escolar o académico?",
    reversed: false,
  },
  {
    block: "T - Trabajo (Estudio) y Tipo de Personalidad",
    field: "fantastic_32",
    label:
      "¿Puedo controlar mi enojo cuando pierdo un partido o cometo un error?",
    reversed: false,
  },
  {
    block: "T - Trabajo (Estudio) y Tipo de Personalidad",
    field: "fantastic_33",
    label:
      "¿Soy paciente conmigo mismo cuando algo no me sale bien en la cancha?",
    reversed: false,
  },
  {
    block: "T - Trabajo (Estudio) y Tipo de Personalidad",
    field: "fantastic_34",
    label: "¿Suelo cumplir con mis tareas y deberes a tiempo sin estresarme?",
    reversed: false,
  },
  {
    block: "T - Trabajo (Estudio) y Tipo de Personalidad",
    field: "fantastic_35",
    label:
      "¿Me considero una persona competitiva de forma sana (sin agresividad)?",
    reversed: false,
  },
  {
    block: "I - Introspección (Imagen Interior)",
    field: "fantastic_36",
    label: "¿Me siento una persona valiosa y con buenas capacidades?",
    reversed: false,
  },
  {
    block: "I - Introspección (Imagen Interior)",
    field: "fantastic_37",
    label: "¿Soy optimista sobre mi futuro en el deporte y en mi vida?",
    reversed: false,
  },
  {
    block: "I - Introspección (Imagen Interior)",
    field: "fantastic_38",
    label: "¿Me siento feliz la mayor parte del tiempo?",
    reversed: false,
  },
  {
    block: "I - Introspección (Imagen Interior)",
    field: "fantastic_39",
    label: "¿Soy consciente de mis fortalezas y de lo que debo mejorar?",
    reversed: false,
  },
  {
    block: "I - Introspección (Imagen Interior)",
    field: "fantastic_40",
    label: "¿Me trato a mí mismo con respeto y cuidado?",
    reversed: false,
  },
  {
    block: "C - Conducción y Comportamiento Social",
    field: "fantastic_41",
    label:
      "¿Uso siempre los implementos de seguridad (espinilleras, calzado adecuado)?",
    reversed: false,
  },
  {
    block: "C - Conducción y Comportamiento Social",
    field: "fantastic_42",
    label:
      "¿Respeto las normas de tránsito al caminar o andar en bicicleta hacia el club?",
    reversed: false,
  },
  {
    block: "C - Conducción y Comportamiento Social",
    field: "fantastic_43",
    label: "¿Sigo las normas de convivencia y respeto a mis entrenadores?",
    reversed: false,
  },
  {
    block: "C - Conducción y Comportamiento Social",
    field: "fantastic_44",
    label: "¿Respeto a mis rivales y árbitros durante los partidos?",
    reversed: false,
  },
  {
    block: "C - Conducción y Comportamiento Social",
    field: "fantastic_45",
    label:
      "¿Busco ayuda profesional o de un adulto cuando me siento enfermo o lesionado?",
    reversed: false,
  },
];

export interface EmotionalQuestionValue {
  question: string;
  answer: string;
  value: number;
}

const createOptions = (reversed: boolean) =>
  reversed
    ? [
        { value: "0", label: "(0) Casi siempre" },
        { value: "1", label: "(1) A veces" },
        { value: "2", label: "(2) Casi nunca" },
      ]
    : [
        { value: "2", label: "(2) Casi siempre" },
        { value: "1", label: "(1) A veces" },
        { value: "0", label: "(0) Casi nunca" },
      ];

const categoryLabels = [
  {
    label: "Excelente (Nivel Pro)",
    description: "El joven es un ejemplo de estilo de vida saludable.",
    min: 85,
  },
  {
    label: "Muy Bueno",
    description: "Estilo de vida sólido; reforzar áreas con puntaje bajo.",
    min: 70,
  },
  {
    label: "Regular / Alerta",
    description: "Hay hábitos que están limitando su potencial deportivo.",
    min: 50,
  },
  {
    label: "Riesgo Moderado",
    description: "Requiere seguimiento pedagógico y charla con la familia.",
    min: 35,
  },
  {
    label: "Riesgo Alto",
    description: "Intervención inmediata por parte del equipo psicosocial.",
    min: 0,
  },
];

const fantasticSections = fantasticQuestions.reduce(
  (sections, question) => {
    const current = sections[sections.length - 1];
    if (current?.block === question.block) {
      current.questions.push(question);
    } else {
      sections.push({ block: question.block, questions: [question] });
    }
    return sections;
  },
  [] as Array<{
    block: string;
    questions: typeof fantasticQuestions;
  }>,
);

export const EmotionalForm = ({ data, onChange }: EmotionalFormProps) => {
  const [activeTab, setActiveTab] = useState<string>(
    fantasticSections[0]?.block ?? "F - Familia y Amigos",
  );
  const emotionalData = (data as EmotionalData) || {};

  const getQuestionValue = (field: string): number | undefined => {
    const rawValue = emotionalData[field];

    if (typeof rawValue === "number") return rawValue;
    if (
      rawValue &&
      typeof rawValue === "object" &&
      "value" in rawValue &&
      typeof rawValue.value === "number"
    ) {
      return rawValue.value;
    }

    return undefined;
  };

  const handleChange = (
    field: string,
    value: number | string,
    answer?: string,
  ) => {
    if (field === "observaciones") {
      onChange({
        ...emotionalData,
        observaciones: String(value),
      } as Json);
      return;
    }

    const numericValue = typeof value === "string" ? Number(value) : value;
    const question =
      fantasticQuestions.find((item) => item.field === field)?.label ?? field;

    onChange({
      ...emotionalData,
      [field]: {
        question,
        answer: answer ?? String(value),
        value: numericValue,
      } as EmotionalQuestionValue,
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
    value: number | undefined;
    options: Array<{ value: string; label: string }>;
  }) => (
    <div className="space-y-3 p-4 border rounded-lg">
      <Label className="text-base font-medium">{label}</Label>
      <RadioGroup
        value={value !== undefined ? String(value) : ""}
        onValueChange={(val) => {
          const option = options.find((item) => item.value === val);
          handleChange(field, val, option?.label ?? val);
        }}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem
              value={option.value}
              id={`${field}-${option.value}`}
            />
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

  const answeredValues = fantasticQuestions.map((question) => {
    const value = getQuestionValue(question.field);
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
  });

  const rawScore = answeredValues.reduce((acc, value) => acc + value, 0);
  const scaledScore = Math.round((rawScore / 90) * 100);
  const category =
    categoryLabels.find((item) => scaledScore >= item.min) ||
    categoryLabels[categoryLabels.length - 1];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Cuestionario FANTASTIC
        </CardTitle>
        <CardDescription>
          Evaluación psicosocial adaptada al contexto de futbolistas. Cada
          respuesta suma 0, 1 o 2 puntos y el total se multiplica por 2.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-muted/50 p-4">
            <p className="text-sm font-semibold">Puntaje bruto</p>
            <p className="text-2xl font-bold">{rawScore}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/50 p-4">
            <p className="text-sm font-semibold">Puntaje escalado</p>
            <p className="text-2xl font-bold">{scaledScore}</p>
            <p className="text-xs text-muted-foreground">{category.label}</p>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value)}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-9 gap-2 overflow-x-auto">
            {fantasticSections.map((section) => (
              <TabsTrigger
                key={section.block}
                value={section.block}
                className="text-xs sm:text-sm"
              >
                {section.block.split(" ")[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {fantasticSections.map((section) => (
            <TabsContent
              key={section.block}
              value={section.block}
              className="space-y-4"
            >
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                <p className="text-sm font-semibold text-primary">
                  {section.block}
                </p>
              </div>
              <div className="space-y-4">
                {section.questions.map((question) => (
                  <QuestionWithOptions
                    key={question.field}
                    label={question.label}
                    field={question.field}
                    value={getQuestionValue(question.field)}
                    options={createOptions(question.reversed)}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="space-y-2 pt-4">
          <Label htmlFor="observaciones_psico">Observaciones</Label>
          <Textarea
            id="observaciones_psico"
            value={String(emotionalData.observaciones || "")}
            onChange={(e) => handleChange("observaciones", e.target.value)}
            placeholder="Notas sobre comportamiento, emociones, situación familiar, etc..."
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
};
