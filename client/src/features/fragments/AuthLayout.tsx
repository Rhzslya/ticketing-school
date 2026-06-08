import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion, type Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerHref: string;
  isLoading: boolean;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function AuthLayout({
  title,
  description,
  children,
  footerText,
  footerLinkText,
  footerHref,
  isLoading,
}: AuthLayoutProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      className="w-full max-w-md mx-auto space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="bg-card-foreground border-none shadow-2xl shadow-black/10">
        <motion.div variants={itemVariants}>
          <CardHeader className="space-y-1 sm:space-y-2 pt-8 relative">
            <CardTitle className="text-center text-2xl sm:text-3xl font-bold text-primary tracking-tight">
              {title}
            </CardTitle>
            <CardDescription className="text-center text-muted text-sm sm:text-base px-2">
              {description}
            </CardDescription>
          </CardHeader>
        </motion.div>

        <CardContent className="relative mt-2 sm:mt-6 pb-8">
          {children}

          <motion.nav
            variants={itemVariants}
            className="w-full text-center text-xs sm:text-sm text-muted-foreground mt-6"
          >
            {footerText}{" "}
            <button
              className="font-semibold text-primary hover:text-primary/80 hover:underline transition-all cursor-pointer outline-none focus-visible:ring-1 rounded px-1 disabled:opacity-50"
              onClick={() => !isLoading && navigate(footerHref)}
              disabled={isLoading}
            >
              {footerLinkText}
            </button>
          </motion.nav>
        </CardContent>
      </Card>
    </motion.div>
  );
}
