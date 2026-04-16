import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, TrendingUp } from "lucide-react";

interface EvaluationStatsProps {
  total: number;
}

export const EvaluationStats = ({
  total,
}: EvaluationStatsProps) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Evaluaciones registradas
          </CardTitle>
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
        </CardContent>
      </Card>
    </div>
  );
};
