import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

interface DashboardHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export function DashboardHeader({ title, children }: DashboardHeaderProps) {
  return (
    <header className="flex min-h-16 shrink-0 items-center justify-between gap-2 border-b px-4 sm:px-6 mb-4 sm:mb-6 bg-primary backdrop-blur-md upports-backdrop-filter:bg-primary/60 sticky top-0 z-20">
      <div className="flex items-center gap-2 sm:gap-3">
        <SidebarTrigger className="-ml-2 sm:-ml-4 transition-transform hover:scale-105 active:scale-95 hover:bg-transparent cursor-pointer" />
        <Separator orientation="vertical" className="h-4 sm:h-5" />

        <motion.h1
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-foreground line-clamp-1"
        >
          {title}
        </motion.h1>
      </div>

      {children && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          className="flex items-center gap-2 sm:gap-3 flex-1 justify-end"
        >
          {children}
        </motion.div>
      )}
    </header>
  );
}
