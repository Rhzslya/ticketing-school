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
import { UserValidation } from "@/validation/user-validation";
import type { LoginUserRequest } from "@/model/user-model";
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

export function LoginForm() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useForm<LoginUserRequest>({
    resolver: zodResolver(UserValidation.LOGIN),
    mode: "onSubmit",
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginUserRequest) {
    setIsLoading(true);
    setGlobalError(null);

    try {
      await UserService.login(data);
      navigate("/");
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
              Helpdesk Portal
            </CardTitle>
            <CardDescription className="text-center text-muted text-sm sm:text-base px-2">
              Sign in with your Teacher or Admin account.
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

          <AnimatePresence mode="wait">
            <motion.div
              key="login-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                  noValidate
                  autoComplete="off"
                >
                  <div
                    aria-hidden="true"
                    style={{
                      opacity: 0,
                      position: "absolute",
                      zIndex: -1,
                      width: 0,
                      height: 0,
                      overflow: "hidden",
                    }}
                  >
                    <input
                      type="text"
                      name="fake_username"
                      tabIndex={-1}
                      autoComplete="username"
                    />
                    <input
                      type="password"
                      name="fake_password"
                      tabIndex={-1}
                      autoComplete="current-password"
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem className="relative mb-6 sm:mb-8">
                        <FormControl>
                          <Input
                            autoComplete="nope"
                            placeholder="Email or Username"
                            {...field}
                            disabled={isLoading}
                            className="bg-card-foreground border-muted text-background placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:ring-1 h-11 sm:h-10 text-base sm:text-sm"
                          />
                        </FormControl>
                        <FormMessage className="absolute -bottom-5 sm:-bottom-4 left-0 text-[10px] sm:text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="relative mb-8 sm:mb-8">
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
                              className="absolute right-3 top-3 sm:top-2.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                            >
                              {showPassword ? (
                                <EyeOff className="size-5" />
                              ) : (
                                <Eye className="size-5" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="absolute top-11 sm:top-10 left-0 text-[10px] sm:text-xs" />
                      </FormItem>
                    )}
                  />

                  <Button
                    className="w-full mt-2 text-sm font-semibold shadow-lg shadow-primary/20 cursor-pointer text-secondary-foreground h-11 sm:h-10"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      "Sign In to Portal"
                    )}
                  </Button>
                </form>
              </Form>

              <motion.nav
                variants={itemVariants}
                className="w-full text-center text-xs sm:text-sm text-muted-foreground mt-6"
              >
                Don't have an account?{" "}
                <button
                  className="font-semibold text-primary hover:text-primary/80 hover:underline transition-all cursor-pointer outline-none focus-visible:ring-1 rounded px-1 disabled:opacity-50"
                  onClick={() => !isLoading && navigate("/register")}
                  disabled={isLoading}
                >
                  Register here
                </button>
              </motion.nav>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
