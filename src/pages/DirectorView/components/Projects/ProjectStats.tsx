import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Project } from "@/types";

interface ProjectStatsProps {
  projects: Project[];
}

export const ProjectStats = ({ projects }: ProjectStatsProps) => {
  const stats = useMemo(() => {
    const total = projects.length;
    const totalGoal = projects.reduce((sum, p) => sum + p.goal, 0);
    const totalRaised = projects.reduce((sum, p) => sum + p.raised, 0);
    const totalRaisedFree = projects
      .filter((p) => p.type === "free")
      .reduce((sum, p) => sum + p.raised, 0);
    const completedCount = projects.filter((p) => p.progress >= 100).length;

    return [
      {
        title: "Proyectos Totales",
        value: total.toString(),
        color: "bg-blue-500",
      },
      {
        title: "En Curso",
        value: (total - completedCount).toString(),
        color: "bg-purple-500",
      },
      {
        title: "Meta Total",
        value: `$${(totalGoal / 1000000).toFixed(1)}M`,
        color: "bg-green-500",
      },
      {
        title: "Recaudado proyectos definidos",
        value: `$${(totalRaised / 1000000).toFixed(1)}M`,
        color: "bg-yellow-500",
      },
      {
        title: "Recaudado Inversión Libre",
        value: `$${(totalRaisedFree / 1000000).toFixed(1)}M`,
        color: "bg-teal-500",
      },
    ];
  }, [projects]);

  return (
    <div className="grid gap-4 md:grid-cols-5">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <div className={`h-4 w-4 ${stat.color} rounded-full`}></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
