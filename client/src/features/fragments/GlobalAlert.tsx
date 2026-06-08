import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface GlobalErrorAlertProps {
  error: string | null;
}

export function GlobalErrorAlert({ error }: GlobalErrorAlertProps) {
  return (
    <AnimatePresence initial={false}>
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="bg-destructive/15 px-4 py-3 rounded-lg text-destructive flex items-start gap-3 border border-destructive/20 shadow-sm">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span className="text-xs sm:text-sm font-medium leading-relaxed">
              {error}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
