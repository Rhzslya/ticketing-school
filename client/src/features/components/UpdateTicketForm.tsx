import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { TicketValidation } from "@/validation/ticket-validation";
import { Priority, TicketCategory, Status } from "@/enum/ticket";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Info,
  Loader2,
  Paperclip,
  Sparkles,
  X,
} from "lucide-react";
import { ACCEPTED_IMAGE_TYPES } from "@/utils/image-type";
import { useTicketQueries } from "@/hooks/ticket-queries";
import { isAxiosError } from "axios";
import { getErrorMessage } from "@/lib/utils";
import { AiService } from "@/service/ai-analyze-service";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import type { UserResponse } from "@/model/user-model";

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
  const [deleteAttachment, setDeleteAttachment] = useState(false);

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
        payload.delete_attachment = deleteAttachment;
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

  const statusLabels: Record<Status, string> = {
    [Status.SUBMITTED]: "Submitted",
    [Status.ONGOING]: "Ongoing",
    [Status.DONE]: "Done",
    [Status.REJECTED]: "Rejected",
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-background/80 font-semibold">
                        Status
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading || isStatusDisabled}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={`${inputStyle} h-11 sm:h-10 text-base sm:text-sm w-full text-left [&>span]:truncate`}
                          >
                            <SelectValue placeholder="Select status..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* 2. CATEGORY */}
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
                        disabled={isLoading || isContentDisabled}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={`${inputStyle} h-11 sm:h-10 text-base sm:text-sm w-full text-left [&>span]:truncate`}
                          >
                            <SelectValue placeholder="Select category..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(categoryLabels).map(
                            ([key, label]) => (
                              <SelectItem key={key} value={key}>
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

                {/* 3. PRIORITY */}
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
                        disabled={isLoading || isPriorityDisabled}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={`${inputStyle} h-11 sm:h-10 text-base sm:text-sm w-full text-left [&>span]:truncate`}
                          >
                            <SelectValue placeholder="Select priority..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(priorityLabels).map(
                            ([key, label]) => (
                              <SelectItem key={key} value={key}>
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

          {/* Bagian Attachment hanya aktif jika User adalah Creator & tiket masih SUBMITTED */}
          <div
            className={`space-y-4 ${isContentDisabled ? "opacity-50 pointer-events-none" : ""}`}
          >
            {ticket.attachment_url && ticket.attachment_url.length > 0 && (
              <div className="space-y-3 pt-4">
                <FormLabel className="text-background/80 font-semibold">
                  Current Attachments
                </FormLabel>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-card-foreground/50 border border-muted/50 p-4 rounded-xl">
                  <div
                    className={`flex gap-3 transition-opacity ${deleteAttachment ? "opacity-30 grayscale" : ""}`}
                  >
                    {ticket.attachment_url.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative size-16 sm:size-20 rounded-lg overflow-hidden border border-muted"
                      >
                        <img
                          src={url}
                          alt="Attachment"
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="sm:ml-auto">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="delete_old_attachments"
                        checked={deleteAttachment}
                        onCheckedChange={(checked) => {
                          setDeleteAttachment(checked === true);
                          form.setValue("delete_attachment", checked === true, {
                            shouldDirty: true,
                          });
                        }}
                        disabled={isLoading || isContentDisabled}
                      />
                      <label
                        htmlFor="delete_old_attachments"
                        className="text-sm font-medium text-destructive"
                      >
                        Remove Existing Attachments
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="attachments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-background/80 font-semibold">
                    Add New Attachments (Max 3)
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={
                            isLoading ||
                            (field.value?.length || 0) >= 3 ||
                            isContentDisabled
                          }
                          onClick={() =>
                            document
                              .getElementById("update-file-upload")
                              ?.click()
                          }
                        >
                          <Paperclip className="size-4 mr-2" /> Choose Image
                        </Button>
                        <input
                          id="update-file-upload"
                          type="file"
                          multiple
                          accept={ACCEPTED_IMAGE_TYPES.join(",")}
                          className="hidden"
                          onChange={(e) => {
                            const newFiles = Array.from(e.target.files || []);
                            field.onChange(
                              [...(field.value || []), ...newFiles].slice(0, 3),
                            );
                            e.target.value = "";
                          }}
                        />
                      </div>

                      {field.value && field.value.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {field.value.map((file, index) => (
                            <div
                              key={index}
                              className="flex justify-between p-2.5 border rounded-lg"
                            >
                              <span className="text-xs truncate">
                                {file.name}
                              </span>
                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() =>
                                  field.onChange(
                                    field.value!.filter((_, i) => i !== index),
                                  )
                                }
                                className="text-destructive p-1"
                              >
                                <X className="size-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

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
