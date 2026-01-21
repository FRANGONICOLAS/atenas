import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProjectStatsData {
  total: number;
  inProgress: number;
  totalGoal: number;
  totalRaised: number;
  totalRaisedFree: number;
  completedCount: number;
}

interface ProjectStatsProps {
  stats: ProjectStatsData;
}

export const ProjectStats = ({ stats }: ProjectStatsProps) => {
  const displayStats = [
    {
      title: "Proyectos Totales",
      value: stats.total.toString(),
      color: "bg-blue-500",
    },
    {
      title: "En Curso",
      value: stats.inProgress.toString(),
      color: "bg-purple-500",
    },
    {
      title: "Meta Total",
      value: `$${(stats.totalGoal / 1000000).toFixed(1)}M`,
      color: "bg-green-500",
    },
    {
      title: "Recaudado proyectos definidos",
      value: `$${(stats.totalRaised / 1000000).toFixed(1)}M`,
      color: "bg-yellow-500",
    },
    {
      title: "Recaudado Inversión Libre",
      value: `$${(stats.totalRaisedFree / 1000000).toFixed(1)}M`,
      color: "bg-teal-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-5">
      {displayStats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
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
