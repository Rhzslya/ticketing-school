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
import { UserValidation } from "@/validation/user-validation";
import type { LoginUserRequest } from "@/model/user-model";
import { getErrorMessage } from "@/lib/utils";
import { AuthLayout } from "../fragments/AuthLayout";
import { GlobalErrorAlert } from "../fragments/GlobalAlert";
import { PasswordInput } from "../fragments/PasswordInput";
import DisabledAutoFill from "../fragments/DisabledAutoFill";
import { useUserQueries } from "@/hooks/user-queries";

export function LoginForm() {
  const navigate = useNavigate();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const { loginMutation } = useUserQueries();
  const { mutateAsync: login, isPending: isLoading } = loginMutation;

  const form = useForm<LoginUserRequest>({
    resolver: zodResolver(UserValidation.LOGIN),
    defaultValues: { identifier: "", password: "" },
  });

  async function onSubmit(data: LoginUserRequest) {
    setGlobalError(null);
    try {
      await login(data);
      navigate("/");
    } catch (error) {
      setGlobalError(
        isAxiosError(error)
          ? getErrorMessage(error)
          : "A system error occurred.",
      );
    }
  }

  return (
    <AuthLayout
      title="Helpdesk Portal"
      description="Sign in with your Teacher or Admin account."
      footerText="Don't have an account?"
      footerLinkText="Register here"
      footerHref="/register"
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
            name="identifier"
            render={({ field }) => (
              <FormItem className="relative mb-6 sm:mb-8">
                <FormControl>
                  <Input
                    placeholder="Email or Username"
                    autoComplete="nope"
                    {...field}
                    disabled={isLoading}
                    className="bg-card-foreground border-muted text-background placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:ring-1 h-11 sm:h-10"
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
              <FormItem className="relative mb-8">
                <FormControl>
                  <PasswordInput
                    placeholder="Password"
                    autoComplete="nope"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage className="absolute -bottom-5 sm:-bottom-4 left-0 text-[10px] sm:text-xs" />
              </FormItem>
            )}
          />

          <Button
            className="w-full h-11 sm:h-10 text-secondary-foreground"
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
    </AuthLayout>
  );
}
