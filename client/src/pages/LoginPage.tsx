import { LoginForm } from "@/features/components/LoginForm";
import { motion } from "framer-motion";

const LoginPage = () => {
  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center bg-secondary-foreground p-4 sm:p-6 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-linear-to-b from-primary/10 to-transparent pointer-events-none" />

      <div className="w-full max-w-md space-y-4 z-10 flex-1 flex flex-col justify-center">
        <LoginForm />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="w-full text-center mt-8 pb-4"
      >
        {/* <p className="text-xs sm:text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Sinari Cell.{" "}
          {t("auth.common.copyright")}
        </p> */}
      </motion.div>
    </div>
  );
};

export default LoginPage;
