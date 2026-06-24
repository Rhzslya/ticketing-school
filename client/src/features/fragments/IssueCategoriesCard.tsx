import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TicketStatisticsResponse } from "@/model/ticket-model";
import {
  Building2,
  Cpu,
  HelpCircle,
  MonitorSmartphone,
  Server,
  Zap,
} from "lucide-react";

type CategoryItemProps = {
  icon: React.ReactNode;
  label: string;
  count: number;
};

const CategoryItem = ({ icon, label, count }: CategoryItemProps) => (
  <div
    className="p-4 rounded-2xl border border-slate-100 bg-slate-50 
  hover:bg-slate-100 transition-colors"
  >
    {icon}
    <p className="text-xs text-muted font-medium">{label}</p>
    <p className="text-xl font-bold text-muted">{count}</p>
  </div>
);

type IssueCategoriesCardProps = {
  stats: TicketStatisticsResponse;
};

export const IssueCategoriesCard = ({ stats }: IssueCategoriesCardProps) => {
  const categories: CategoryItemProps[] = [
    {
      icon: <Server className="size-5 text-[#2ecc71] mb-2" />,
      label: "Network & Internet",
      count: stats.byCategory.NETWORK,
    },
    {
      icon: <Cpu className="size-5 text-[#3498db] mb-2" />,
      label: "Hardware",
      count: stats.byCategory.HARDWARE,
    },
    {
      icon: <MonitorSmartphone className="size-5 text-[#9b59b6] mb-2" />,
      label: "Software",
      count: stats.byCategory.SOFTWARE,
    },
    {
      icon: <Zap className="size-5 text-[#f1c40f] mb-2" />,
      label: "Electrical",
      count: stats.byCategory.ELECTRICAL,
    },
    {
      icon: <Building2 className="size-5 text-[#e67e22] mb-2" />,
      label: "General Facilities",
      count: stats.byCategory.FACILITIES,
    },
    {
      icon: <HelpCircle className="size-5 text-[#e74c3c] mb-2" />,
      label: "Others",
      count: stats.byCategory.OTHERS,
    },
  ];

  return (
    <Card
      className="bg-primary flex-1 shadow-sm border-slate-200/60 
  rounded-3xl"
    >
      <CardHeader className="border-b border-slate-100 pb-4">
        <CardTitle className="text-lg font-bold text-white">
          Issue Categories
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Breakdown by device/issue type
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4">
          {categories.map((c) => (
            <CategoryItem key={c.label} {...c} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
