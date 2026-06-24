import { DashboardHeader } from "@/features/fragments/DashboardHeader";
import { useTicketQueries } from "@/hooks/ticket-queries";
import { isAxiosError } from "axios";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, type Variants } from "framer-motion";
import { Loader2 } from "lucide-react";
import { PriorityLevelsCard } from "@/features/fragments/PriorityLevelCard";
import { IssueCategoriesCard } from "@/features/fragments/IssueCategoriesCard";
import { StatCardsSection } from "@/features/fragments/StatsCardSession";

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

      <StatCardsSection stats={stats} />

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <motion.div variants={itemVariants} className="flex flex-col">
          <PriorityLevelsCard stats={stats} />
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col">
          <IssueCategoriesCard stats={stats} />
        </motion.div>
      </div>
    </motion.div>
  );
};
