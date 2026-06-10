import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { TicketValidation } from "@/validation/ticket-validation";
import { Status } from "@/enum/ticket";
import type { TicketResponse, UpdateTicketRequest } from "@/model/ticket-model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { AlertCircle, Info, Loader2, Sparkles } from "lucide-react";
import { useTicketQueries } from "@/hooks/ticket-queries";
import { isAxiosError } from "axios";
import { getErrorMessage } from "@/lib/utils";
import { AiService } from "@/service/ai-analyze-service";
import { motion, AnimatePresence } from "framer-motion";
import type { UserResponse } from "@/model/user-model";
import { TicketClassificationFields } from "../fragments/TicketClassificationFields";
import { TicketAttachmentInput } from "../fragments/TicketAttachmentInput";

const inputStyle =
  "bg-card-foreground border-muted text-background placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:ring-1 h-11 sm:h-10 text-base sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed";

export const UpdateTicketForm = ({
  ticket,
  currentUser,
}: {
  ticket: TicketResponse;
  currentUser: UserResponse;
}) => {
  const navigate = useNavigate();
  const { updateTicketMutation } = useTicketQueries();
  const { mutateAsync: updateTicket } = updateTicketMutation;
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const isAdmin = currentUser.role === "ADMIN";
  const isCreator = String(currentUser.id) === String(ticket.submitterId);

  const isContentDisabled = !isCreator || ticket.status !== Status.SUBMITTED;

  const isPriorityDisabled = !isAdmin && ticket.status !== Status.SUBMITTED;

  const isStatusDisabled = !isAdmin;
  // -------------------------

  const form = useForm<UpdateTicketRequest>({
    resolver: zodResolver(
      TicketValidation.UPDATE,
    ) as Resolver<UpdateTicketRequest>,
    mode: "onChange",
    defaultValues: {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      category: ticket.category,
      status: ticket.status,
      delete_attachment: false,
      attachments: [],
    },
  });

  const { isDirty, isValid } = form.formState;

  const onSubmit = async (data: UpdateTicketRequest) => {
    setIsLoading(true);
    try {
      const payload: UpdateTicketRequest = {
        id: ticket.id,
        priority: data.priority,
      };

      if (isAdmin && data.status) payload.status = data.status;

      if (!isContentDisabled) {
        payload.title = data.title;
        payload.description = data.description;
        payload.category = data.category;
        payload.delete_attachment = data.delete_attachment;
        if (data.attachments) payload.attachments = data.attachments;
      }

      await updateTicket(payload);
      navigate(`/tickets/${ticket.id}`);
    } catch (error) {
      if (isAxiosError(error)) {
        setGlobalError(getErrorMessage(error));
      } else {
        setGlobalError("A system error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  async function handleAnalyzeAI() {
    const description = form.getValues("description");

    if (!description || description.trim().length < 10) {
      setGlobalError(
        "Tuliskan deskripsi minimal 10 karakter agar AI dapat menganalisis.",
      );
      return;
    }

    setIsAnalyzing(true);
    setGlobalError(null);

    try {
      const aiResult = await AiService.analyzeTicket(description);
      form.setValue("category", aiResult.category, {
        shouldValidate: true,
        shouldDirty: true,
      });
      form.setValue("priority", aiResult.priority, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } catch (error) {
      setGlobalError(
        isAxiosError(error)
          ? getErrorMessage(error)
          : "A system error occurred.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="w-full">
      <AnimatePresence initial={false}>
        {globalError && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-destructive/15 px-4 py-3 rounded-lg text-destructive flex items-start gap-3 border border-destructive/20 shadow-sm">
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              <span className="text-sm font-medium leading-relaxed">
                {globalError}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-background/80 font-semibold">
                  Issue Title
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isLoading || isContentDisabled}
                    className={`${inputStyle}`}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-background/80 font-semibold">
                  Detailed Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    disabled={isLoading || isContentDisabled}
                    className={`${inputStyle} min-h-30 resize-y py-3`}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <div className="mt-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-background/90">
                  Classification & Status
                </h3>
                <div className="flex items-start gap-1.5 text-xs text-muted-foreground max-w-md">
                  <Info className="size-3.5 mt-0.5 shrink-0 text-primary" />
                  <p className="leading-relaxed">
                    Update classification or assign status.
                  </p>
                </div>
              </div>

              {!isContentDisabled && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 h-9 px-4 text-xs font-medium w-full sm:w-auto rounded-full"
                  onClick={handleAnalyzeAI}
                  disabled={isAnalyzing || isLoading}
                >
                  <Sparkles className="mr-2 size-3.5 text-yellow-500" />{" "}
                  Generate With AI
                </Button>
              )}
            </div>

            <div className="p-5 border border-muted rounded-xl relative">
              {isAnalyzing && (
                <div className="absolute inset-0 z-10 backdrop-blur-[2px] flex items-center justify-center rounded-xl">
                  <Loader2 className="size-6 animate-spin text-primary" />
                </div>
              )}

              <TicketClassificationFields
                control={form.control}
                disabled={isLoading}
                showStatus={true}
                statusDisabled={isStatusDisabled}
                categoryDisabled={isContentDisabled}
                priorityDisabled={isPriorityDisabled}
              />
            </div>
          </div>

          <TicketAttachmentInput
            control={form.control}
            disabled={isLoading || isContentDisabled}
          />
          <div className="pt-4 flex justify-end gap-3 border-t mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isLoading || isAnalyzing}
              className="min-w-1/8 border-muted text-foreground hover:bg-muted hover:text-foreground/70 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isLoading || isAnalyzing || !isValid || !isDirty}
              className="min-w-1/6 cursor-pointer shadow-lg shadow-primary/20 text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UpdateTicketForm;
