import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAnthropometricEvaluationTabs } from "@/hooks/useSedeEvaluations";

interface AnthropometricEvaluationTabsProps {
  detail?: Record<string, unknown>;
}

const AnthropometricEvaluationTabs = ({
  detail,
}: AnthropometricEvaluationTabsProps) => {
  const sections = getAnthropometricEvaluationTabs(detail);

  if (sections.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Sin datos registrados.
      </div>
    );
  }

  return (
    <Tabs defaultValue={sections[0].id} className="space-y-4">
      <TabsList className="grid grid-cols-5 gap-2 overflow-x-auto">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {section.metrics.map((metric) => (
              <div
                key={metric.key}
                className="rounded-2xl border border-border bg-background p-4"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {metric.label}
                </p>
                <p className="mt-2 font-semibold">{metric.value}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default AnthropometricEvaluationTabs;
