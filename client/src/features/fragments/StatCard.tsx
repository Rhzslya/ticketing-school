import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatCardProps = {
  cardBg: string;
  title: string;
  titleColor?: string;
  icon: React.ReactNode;
  iconContainerClass: string;
  value: number;
  valueColor?: string;
  description: React.ReactNode;
};
export const StatCard = ({
  cardBg,
  title,
  titleColor = "text-white",
  icon,
  iconContainerClass,
  value,
  valueColor = "text-white",
  description,
}: StatCardProps) => (
  <Card
    className={`${cardBg} shadow-sm hover:shadow-md transition-shadow
  border-slate-200/60 rounded-2xl`}
  >
    <CardHeader
      className="flex flex-row items-center justify-between
  space-y-0 pb-2"
    >
      <CardTitle
        className={`text-xs sm:text-sm font-semibold ${titleColor} uppercase 
  tracking-wider`}
      >
        {title}
      </CardTitle>
      <div className={`p-2 rounded-full ${iconContainerClass}`}>{icon}</div>
    </CardHeader>
    <CardContent>
      <div
        className={`text-2xl sm:text-3xl font-bold tracking-tight 
  ${valueColor}`}
      >
        {value}
      </div>
      <p className="text-[10px] sm:text-xs mt-1.5 font-medium text-muted">
        {description}
      </p>
    </CardContent>
  </Card>
);
