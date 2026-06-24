import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TicketStatisticsResponse } from "@/model/ticket-model";
import { Activity, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

type PriorityBarProps = {
  icon: React.ReactNode;
  label: string;
  count: number;
  percentage: number;
  labelColor: string;
  barColor: string;
};

const PriorityBar = ({
  icon,
  label,
  count,
  percentage,
  labelColor,
  barColor,
}: PriorityBarProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-sm">
      <div className={`flex items-center gap-2 font-semibold ${labelColor}`}>
        {icon} {label}
      </div>
      <span className="font-bold text-foreground">{count} Tickets</span>
    </div>
    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full ${barColor} rounded-full`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>
);

type PriorityLevelsCardProps = {
  stats: TicketStatisticsResponse;
};

export const PriorityLevelsCard = ({ stats }: PriorityLevelsCardProps) => {
  const calculatePercentage = (value: number) => {
    if (stats.total === 0) return 0;
    return Math.round((value / stats.total) * 100);
  };

  const priorities: PriorityBarProps[] = [
    {
      icon: <AlertTriangle className="size-4" />,
      label: "High",
      count: stats.byPriority.HIGH,
      percentage: calculatePercentage(stats.byPriority.HIGH),
      labelColor: "text-red-600",
      barColor: "bg-red-500",
    },
    {
      icon: <Activity className="size-4" />,
      label: "Medium",
      count: stats.byPriority.MEDIUM,
      percentage: calculatePercentage(stats.byPriority.MEDIUM),
      labelColor: "text-orange-500",
      barColor: "bg-orange-400",
    },
    {
      icon: <CheckCircle2 className="size-4" />,
      label: "Low",
      count: stats.byPriority.LOW,
      percentage: calculatePercentage(stats.byPriority.LOW),
      labelColor: "text-teal-600",
      barColor: "bg-teal-500",
    },
  ];

  return (
    <Card
      className="bg-primary flex-1 shadow-sm border-slate-200/60
  rounded-3xl"
    >
      <CardHeader className="border-b border-slate-100 pb-4">
        <CardTitle className="text-lg font-bold text-white">
          Priority Levels
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Distribution of incoming ticket urgency
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {priorities.map((p) => (
          <PriorityBar key={p.label} {...p} />
        ))}

        <div
          className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl 
  flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <XCircle className="size-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-red-800 uppercase">
                Rejected Tickets
              </p>
              <p className="text-xs text-red-600/80">Invalid reports / spam</p>
            </div>
          </div>
          <div className="text-xl font-black text-red-600">
            {stats.byStatus.REJECTED}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
