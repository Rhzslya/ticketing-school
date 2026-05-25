import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardHeader } from "@/features/fragments/DashboardHeader";
import { useTicketQueries } from "@/hooks/ticket-queries";
import { isAxiosError } from "axios";
import {
  Activity,
  CheckCircle2,
  Clock,
  Ticket as TicketIcon,
  XCircle,
  AlertTriangle,
  Server,
  Cpu,
  MonitorSmartphone,
  Zap,
  Building2,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, type Variants } from "framer-motion";
import { Loader2 } from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export const DashboardPage = () => {
  const { useStatistics } = useTicketQueries();
  const { data: stats, isLoading, isError, error, refetch } = useStatistics();

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-muted font-medium">Loading statistics...</p>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4 px-4 text-center">
        <AlertTriangle className="size-12 text-red-500 mb-2" />
        <p className="text-white font-bold text-lg">Failed to Load Dashboard</p>
        <p className="text-sm text-muted max-w-md">
          {isAxiosError(error) ? error.message : "A system error occurred."}
        </p>
        <Button variant="outline" onClick={() => refetch()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  return (
    <motion.div
      className="space-y-6 sm:space-y-8 pb-8 font-sans"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <DashboardHeader title="Admin Dashboard" />
      </motion.div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={itemVariants}>
          <Card className="bg-[#e74c3c] shadow-sm hover:shadow-md transition-shadow border-slate-200/60 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">
                Total Tickets
              </CardTitle>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                <TicketIcon className="size-4 sm:size-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {stats.total}
              </div>
              <p className="text-[10px] sm:text-xs mt-1.5 font-medium text-muted">
                All tickets recorded in the system
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-[#f1c40f] shadow-sm hover:shadow-md transition-shadow border-slate-200/60 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">
                Awaiting Response
              </CardTitle>
              <div className="p-2 bg-slate-100 text-[#f1c40f] rounded-full">
                <Clock className="size-4 sm:size-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {stats.byStatus.SUBMITTED}
              </div>
              <p className="text-[10px] sm:text-xs mt-1.5 font-medium text-muted">
                Tickets with <span className="font-bold">SUBMITTED</span> status
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-[#5191d1] shadow-sm hover:shadow-md transition-shadow border-slate-200/60 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">
                In Progress
              </CardTitle>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-full">
                <Activity className="size-4 sm:size-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {stats.byStatus.ONGOING}
              </div>
              <p className="text-[10px] sm:text-xs mt-1.5 font-medium text-muted">
                Tickets with <span className="font-bold">ONGOING</span> status
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-green-400 shadow-sm hover:shadow-md transition-shadow border-emerald-100  rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-semibold text-emerald-800 uppercase tracking-wider">
                Tasks Completed
              </CardTitle>
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
                <CheckCircle2 className="size-4 sm:size-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-700">
                {stats.byStatus.DONE}
              </div>
              <p className="text-[10px] sm:text-xs mt-1.5 font-medium text-muted">
                Tickets with <span className="font-bold">DONE</span> status
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <motion.div variants={itemVariants} className="flex flex-col">
          <Card className="bg-primary flex-1 shadow-sm border-slate-200/60 rounded-3xl">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-bold text-white">
                Priority Levels
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Distribution of incoming ticket urgency
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 font-semibold text-red-600">
                    <AlertTriangle className="size-4" /> High
                  </div>
                  <span className="font-bold text-foreground">
                    {stats.byPriority.HIGH} Tickets
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{
                      width: `${calculatePercentage(stats.byPriority.HIGH, stats.total)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 font-semibold text-orange-500">
                    <Activity className="size-4" /> Medium
                  </div>
                  <span className="font-bold text-foreground">
                    {stats.byPriority.MEDIUM} Tickets
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-400 rounded-full"
                    style={{
                      width: `${calculatePercentage(stats.byPriority.MEDIUM, stats.total)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 font-semibold text-teal-600">
                    <CheckCircle2 className="size-4" /> Low
                  </div>
                  <span className="font-bold text-foreground">
                    {stats.byPriority.LOW} Tickets
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full"
                    style={{
                      width: `${calculatePercentage(stats.byPriority.LOW, stats.total)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <XCircle className="size-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-red-800 uppercase">
                      Rejected Tickets
                    </p>
                    <p className="text-xs text-red-600/80">
                      Invalid reports / spam
                    </p>
                  </div>
                </div>
                <div className="text-xl font-black text-red-600">
                  {stats.byStatus.REJECTED}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col">
          <Card className="bg-primary flex-1 shadow-sm border-slate-200/60 rounded-3xl">
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
                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
                  <Server className="size-5 text-[#2ecc71] mb-2" />
                  <p className="text-xs text-muted font-medium">
                    Network & Internet
                  </p>
                  <p className="text-xl font-bold text-muted">
                    {stats.byCategory.NETWORK}
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
                  <Cpu className="size-5 text-[#3498db] mb-2" />
                  <p className="text-xs text-muted font-medium">Hardware</p>
                  <p className="text-xl font-bold text-muted">
                    {stats.byCategory.HARDWARE}
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
                  <MonitorSmartphone className="size-5 text-[#9b59b6] mb-2" />
                  <p className="text-xs text-muted font-medium">Software</p>
                  <p className="text-xl font-bold text-muted">
                    {stats.byCategory.SOFTWARE}
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
                  <Zap className="size-5 text-[#f1c40f] mb-2" />
                  <p className="text-xs text-muted font-medium">Electrical</p>
                  <p className="text-xl font-bold text-muted">
                    {stats.byCategory.ELECTRICAL}
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
                  <Building2 className="size-5 text-[#e67e22] mb-2" />
                  <p className="text-xs text-muted font-medium">
                    General Facilities
                  </p>
                  <p className="text-xl font-bold text-muted">
                    {stats.byCategory.FACILITIES}
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
                  <HelpCircle className="size-5 text-[#e74c3c] mb-2" />
                  <p className="text-xs text-muted font-medium">Others</p>
                  <p className="text-xl font-bold text-muted">
                    {stats.byCategory.OTHERS}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};
