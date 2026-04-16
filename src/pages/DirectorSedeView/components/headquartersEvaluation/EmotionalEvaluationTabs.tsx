import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFantasticLetterTabs } from "@/hooks/useSedeEvaluations";

interface EmotionalEvaluationTabsProps {
  detail?: Record<string, unknown>;
}

const EmotionalEvaluationTabs = ({ detail }: EmotionalEvaluationTabsProps) => {
  const sections = getFantasticLetterTabs(detail);

  if (sections.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Sin datos registrados.
      </div>
    );
  }

  return (
    <Tabs defaultValue={sections[0].id} className="space-y-4">
      <TabsList className="grid grid-cols-9 gap-2 overflow-x-auto">
        {sections.map((section) => (
          <TabsTrigger
            key={section.id}
            value={section.id}
            className="text-xs sm:text-sm"
          >
            {section.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {sections.map((section) => (
        <TabsContent key={section.id} value={section.id} className="space-y-4">
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
            <p className="text-sm font-semibold text-primary">
              {section.title}
            </p>
          </div>

          <div className="space-y-4">
            {section.questions.map((question) => (
              <div
                key={question.key}
                className="rounded-2xl border border-border bg-background p-4"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {question.key}
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {question.question || question.key}
                </p>
                <div className="mt-2 text-sm">{question.answer}</div>
                {question.score ? (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Puntaje: {question.score}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default EmotionalEvaluationTabs;
