import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import type { RegisterUserRequest } from "@/model/user-model";
import { UserValidation } from "@/validation/user-validation";
import { UserService } from "@/service/user-service";
import { getErrorMessage } from "@/lib/utils";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function RegisterForm() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useForm<RegisterUserRequest>({
    resolver: zodResolver(UserValidation.REGISTER),
    mode: "all",
    defaultValues: {
      email: "",
      username: "",
      password: "",
      fullName: "",
      secondary_number: "", // Honeypot
    },
  });

  async function onSubmit(data: RegisterUserRequest) {
    setIsLoading(true);
    setGlobalError(null);

    try {
      await UserService.register(data);
      navigate("/login");
    } catch (error) {
      if (isAxiosError(error)) {
        setGlobalError(getErrorMessage(error));
      } else {
        setGlobalError("A system error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

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
              Create an Account
            </CardTitle>
            <CardDescription className="text-center text-muted text-sm sm:text-base px-2">
              Sign up to start reporting facility issues.
            </CardDescription>
          </CardHeader>
        </motion.div>

        <CardContent className="relative mt-2 sm:mt-6 pb-8">
          <AnimatePresence initial={false}>
            {globalError && (
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
                    {globalError}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
              autoComplete="off"
            >
              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem className="relative mb-6 sm:mb-8">
                      <FormControl>
                        <Input
                          autoComplete="nope"
                          placeholder="Full Name"
                          {...field}
                          disabled={isLoading}
                          className="bg-card-foreground border-muted text-background placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:ring-1 h-11 sm:h-10 text-base sm:text-sm"
                        />
                      </FormControl>
                      <FormMessage className="absolute -bottom-5 sm:-bottom-4 left-0 text-[10px] sm:text-xs" />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="relative mb-6 sm:mb-8">
                      <FormControl>
                        <Input
                          autoComplete="nope"
                          type="email"
                          placeholder="Email"
                          {...field}
                          disabled={isLoading}
                          className="bg-card-foreground border-muted text-background placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:ring-1 h-11 sm:h-10 text-base sm:text-sm"
                        />
                      </FormControl>
                      <FormMessage className="absolute -bottom-5 sm:-bottom-4 left-0 text-[10px] sm:text-xs" />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="relative mb-6 sm:mb-8">
                      <FormControl>
                        <Input
                          autoComplete="nope"
                          placeholder="Username"
                          {...field}
                          disabled={isLoading}
                          className="bg-card-foreground border-muted text-background placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:ring-1 h-11 sm:h-10 text-base sm:text-sm"
                        />
                      </FormControl>
                      <FormMessage className="absolute -bottom-5 sm:-bottom-4 left-0 text-[10px] sm:text-xs" />
                    </FormItem>
                  )}
                />
              </motion.div>

              <div
                className="absolute opacity-0 w-0 h-0 -z-50 overflow-hidden pointer-events-none select-none"
                aria-hidden="true"
              >
                <FormField
                  control={form.control}
                  name="secondary_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          autoComplete="off"
                          tabIndex={-1}
                          placeholder="Secondary Phone Number"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="relative mb-8">
                      <FormControl>
                        <div className="relative">
                          <Input
                            autoComplete="nope"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            {...field}
                            disabled={isLoading}
                            className="bg-card-foreground border-muted text-background placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:ring-1 h-11 sm:h-10 text-base sm:text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                            className="absolute right-3 top-3 sm:top-2.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="size-5" />
                            ) : (
                              <Eye className="size-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="absolute -bottom-5 sm:-bottom-4 left-0 text-[10px] sm:text-xs" />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button
                  className="w-full mt-2 text-sm text-secondary-foreground font-semibold shadow-lg shadow-primary/20 cursor-pointer h-11 sm:h-10"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    "Register Now"
                  )}
                </Button>
              </motion.div>
            </form>
          </Form>

          <motion.nav
            variants={itemVariants}
            className="w-full text-center text-xs sm:text-sm text-muted-foreground mt-6"
          >
            Already have an account?{" "}
            <button
              className="font-semibold text-primary hover:text-primary/80 hover:underline transition-all cursor-pointer outline-none focus-visible:ring-1 rounded px-1 disabled:opacity-50"
              onClick={() => !isLoading && navigate("/login")}
              disabled={isLoading}
            >
              Sign in here
            </button>
          </motion.nav>
        </CardContent>
      </Card>
    </motion.div>
  );
}
