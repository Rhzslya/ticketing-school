import { motion, type Variants } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  Clock,
  Ticket as TicketIcon,
} from "lucide-react";
import type { TicketStatisticsResponse } from "@/model/ticket-model";
import { StatCard } from "./StatCard";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

type StatCardsSectionProps = {
  stats: TicketStatisticsResponse;
};

export const StatCardsSection = ({ stats }: StatCardsSectionProps) => {
  const cards = [
    {
      cardBg: "bg-[#e74c3c]",
      title: "Total Tickets",
      icon: <TicketIcon className="size-4 sm:size-5" />,
      iconContainerClass: "bg-blue-50 text-blue-600",
      value: stats.total,
      description: "All tickets recorded in the system",
    },
    {
      cardBg: "bg-[#f1c40f]",
      title: "Awaiting Response",
      icon: <Clock className="size-4 sm:size-5" />,
      iconContainerClass: "bg-slate-100 text-[#f1c40f]",
      value: stats.byStatus.SUBMITTED,
      description: (
        <>
          Tickets with <span className="font-bold">SUBMITTED</span>
          status
        </>
      ),
    },
    {
      cardBg: "bg-[#5191d1]",
      title: "In Progress",
      icon: <Activity className="size-4 sm:size-5" />,
      iconContainerClass: "bg-amber-50 text-amber-600",
      value: stats.byStatus.ONGOING,
      description: (
        <>
          Tickets with <span className="font-bold">ONGOING</span>
          status
        </>
      ),
    },
    {
      cardBg: "bg-green-400",
      title: "Tasks Completed",
      titleColor: "text-emerald-800",
      icon: <CheckCircle2 className="size-4 sm:size-5" />,
      iconContainerClass: "bg-emerald-100 text-emerald-600",
      value: stats.byStatus.DONE,
      valueColor: "text-emerald-700",
      description: (
        <>
          Tickets with <span className="font-bold">DONE</span>
          status
        </>
      ),
    },
  ];

  return (
    <div
      className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 
  lg:grid-cols-4"
    >
      {cards.map((card) => (
        <motion.div key={card.title} variants={itemVariants}>
          <StatCard {...card} />
        </motion.div>
      ))}
    </div>
  );
};
