import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Loader2,
  AlertCircle,
  Paperclip,
  X,
  Sparkles,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TicketValidation } from "@/validation/ticket-validation";
import { TicketCategory, Priority } from "@/enum/ticket";
import type { CreateTicketRequest } from "@/model/ticket-model";
import { TicketService } from "@/service/ticket-service";
import { isAxiosError } from "axios";
import { getErrorMessage } from "@/lib/utils";
import { ACCEPTED_IMAGE_TYPES } from "@/utils/image-type";
import { AiService } from "@/service/ai-analyze-service";

const inputStyle =
  "bg-card-foreground border-muted text-background placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:ring-1";

interface CreateTicketFormProps {
  prefillData?: {
    title?: string;
    description?: string;
    category?: TicketCategory;
    priority?: Priority;
  };
}

export const CreateTicketForm = ({
  prefillData,
}: CreateTicketFormProps = {}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const categoryParam = searchParams.get("category") as TicketCategory | null;

  const form = useForm<CreateTicketRequest>({
    resolver: zodResolver(
      TicketValidation.CREATE,
    ) as Resolver<CreateTicketRequest>,
    mode: "onChange",
    defaultValues: {
      title: prefillData?.title || "",
      description: prefillData?.description || "",
      category:
        prefillData?.category ||
        (Object.values(TicketCategory).includes(categoryParam as TicketCategory)
          ? categoryParam!
          : undefined),
      priority: prefillData?.priority || undefined,
      attachments: [],
    },
  });

  const { isValid, isDirty } = form.formState;

  async function onSubmit(data: CreateTicketRequest) {
    setIsLoading(true);
    setGlobalError(null);

    try {
      await TicketService.create(data);
      navigate("/tickets/my-tickets");
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

  async function handleAnalyzeAI() {
    const description = form.getValues("description");

    if (!description || description.trim().length < 10) {
      setGlobalError(
        "Please provide a description of at least 10 characters for the AI to analyze.",
      );
      return;
    }

    setIsAnalyzing(true);
    setGlobalError(null);

    try {
      const aiResult = await AiService.analyzeTicket(description);

      form.setValue("category", aiResult.category, { shouldValidate: true });
      form.setValue("priority", aiResult.priority, { shouldValidate: true });
    } catch (error) {
      if (isAxiosError(error)) {
        setGlobalError(getErrorMessage(error));
      } else {
        setGlobalError("A system error occurred. Please try again.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  }

  const categoryLabels: Record<TicketCategory, string> = {
    [TicketCategory.NETWORK]: "Network & Internet",
    [TicketCategory.HARDWARE]: "Hardware",
    [TicketCategory.SOFTWARE]: "Software",
    [TicketCategory.ELECTRICAL]: "Electrical",
    [TicketCategory.FACILITIES]: "Facilities",
    [TicketCategory.OTHERS]: "Others",
  };

  const priorityLabels: Record<Priority, string> = {
    [Priority.HIGH]: "High",
    [Priority.MEDIUM]: "Medium",
    [Priority.LOW]: "Low",
  };

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
              name="fake_title"
              tabIndex={-1}
              autoComplete="title"
            />
            <input
              type="text"
              name="fake_desc"
              tabIndex={-1}
              autoComplete="current-password"
            />
          </div>

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
                    autoComplete="nope"
                    placeholder="e.g., Projector in Class 10A is Completely Dead"
                    disabled={isLoading}
                    className={`${inputStyle} h-11 sm:h-10 text-base sm:text-sm`}
                    {...field}
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
                    autoComplete="nope"
                    placeholder="Describe the issue"
                    className={`${inputStyle} min-h-30 resize-y text-base sm:text-sm py-3`}
                    disabled={isLoading}
                    {...field}
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
                  Classification Details
                </h3>
                <div className="flex items-start gap-1.5 text-xs text-muted-foreground max-w-md">
                  <Info className="size-3.5 mt-0.5 shrink-0 text-primary" />
                  <p className="leading-relaxed">
                    Fill in manually or let the AI populate it automatically.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 h-9 px-4 text-xs font-medium border-muted/50 text-foreground hover:bg-primary cursor-pointer transition-all w-full sm:w-auto rounded-full shadow-sm"
                onClick={handleAnalyzeAI}
                disabled={isAnalyzing || isLoading}
              >
                <Sparkles className="mr-2 size-3.5 text-yellow-500" />
                Generate With AI
              </Button>
            </div>

            <div className="p-5 border border-muted rounded-xl relative">
              {isAnalyzing && (
                <div className="absolute inset-0 z-10 backdrop-blur-[2px] flex items-center justify-center rounded-xl">
                  <Loader2 className="size-6 animate-spin text-primary" />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-background/80 font-semibold">
                        Category
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={`${inputStyle} h-11 sm:h-10 text-base sm:text-sm w-full text-left [&>span]:truncate`}
                          >
                            <SelectValue placeholder="Select category..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-card-foreground border-muted text-background">
                          {Object.entries(categoryLabels).map(
                            ([key, label]) => (
                              <SelectItem
                                key={key}
                                value={key}
                                className="focus:bg-muted focus:text-white cursor-pointer"
                              >
                                {label}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-background/80 font-semibold">
                        Priority
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={`${inputStyle} h-11 sm:h-10 text-base sm:text-sm w-full text-left [&>span]:truncate`}
                          >
                            <SelectValue placeholder="Select priority..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-card-foreground border-muted text-background">
                          {Object.entries(priorityLabels).map(
                            ([key, label]) => (
                              <SelectItem
                                key={key}
                                value={key}
                                className="focus:bg-muted focus:text-foreground cursor-pointer"
                              >
                                {label}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <FormField
            control={form.control}
            name="attachments"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-background/80 font-semibold">
                  Attachments (Optional, Max 3 Photos)
                </FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-muted text-foreground hover:bg-muted hover:text-foreground/70 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading || (field.value?.length || 0) >= 3}
                        onClick={() =>
                          document.getElementById("file-upload")?.click()
                        }
                      >
                        <Paperclip className="size-4 mr-2" /> Choose Image
                      </Button>
                      <span className="text-xs text-muted-foreground hidden sm:inline-block">
                        Format: JPG, PNG, WEBP (Max 5MB)
                      </span>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept={ACCEPTED_IMAGE_TYPES.join(",")}
                        className="hidden"
                        onChange={(e) => {
                          const selectedFiles = Array.from(
                            e.target.files || [],
                          );
                          const currentFiles = field.value || [];
                          const combinedFiles = [
                            ...currentFiles,
                            ...selectedFiles,
                          ].slice(0, 3);
                          field.onChange(combinedFiles);
                          e.target.value = "";
                        }}
                      />
                    </div>

                    {field.value && field.value.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {field.value.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2.5 border border-muted/50 rounded-lg bg-card-foreground/50 shadow-sm"
                          >
                            <span
                              className="text-xs text-background truncate max-w-37.5"
                              title={file.name}
                            >
                              {file.name}
                            </span>
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => {
                                const newFiles = field.value!.filter(
                                  (_, i) => i !== index,
                                );
                                field.onChange(newFiles);
                              }}
                              className="text-destructive hover:text-destructive/80 transition-colors p-1 rounded-full cursor-pointer"
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <div className="pt-4 flex justify-end gap-3 border-t border-muted/50 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => (isDirty ? form.reset() : navigate(-1))}
              disabled={isLoading || isAnalyzing}
              className="min-w-1/8 border-muted text-foreground hover:bg-muted hover:text-foreground/70 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isDirty ? "Reset" : "Cancel"}
            </Button>

            <Button
              type="submit"
              disabled={isLoading || isAnalyzing || !isValid}
              className="min-w-1/6 cursor-pointer shadow-lg shadow-primary/20 text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
