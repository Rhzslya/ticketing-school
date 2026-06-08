import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { RegisterUserRequest } from "@/model/user-model";
import { UserValidation } from "@/validation/user-validation";
import { getErrorMessage } from "@/lib/utils";

import { AuthLayout } from "../fragments/AuthLayout";
import { GlobalErrorAlert } from "../fragments/GlobalAlert";
import { PasswordInput } from "../fragments/PasswordInput";
import DisabledAutoFill from "../fragments/DisabledAutoFill";
import { useUserQueries } from "@/hooks/user-queries";

export function RegisterForm() {
  const navigate = useNavigate();

  const [globalError, setGlobalError] = useState<string | null>(null);

  const { registerMutation } = useUserQueries();
  const { mutateAsync: register, isPending: isLoading } = registerMutation;

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
    setGlobalError(null);

    try {
      await register(data);
      navigate("/login");
    } catch (error) {
      setGlobalError(
        isAxiosError(error)
          ? getErrorMessage(error)
          : "A system error occurred. Please try again.",
      );
    }
  }

  return (
    <AuthLayout
      title="Create an Account"
      description="Sign up to start reporting facility issues."
      footerText="Already have an account?"
      footerLinkText="Sign in here"
      footerHref="/login"
      isLoading={isLoading}
    >
      <GlobalErrorAlert error={globalError} />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 pt-4"
          noValidate
          autoComplete="off"
        >
          <DisabledAutoFill />

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

          {/* Honeypot Field */}
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="relative mb-8">
                <FormControl>
                  <PasswordInput
                    placeholder="Password"
                    autoComplete="new-password"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage className="absolute -bottom-5 sm:-bottom-4 left-0 text-[10px] sm:text-xs" />
              </FormItem>
            )}
          />

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
        </form>
      </Form>
    </AuthLayout>
  );
}
