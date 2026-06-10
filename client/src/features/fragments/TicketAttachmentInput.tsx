import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Paperclip, X } from "lucide-react";
import { ACCEPTED_IMAGE_TYPES } from "@/utils/image-type";
import type { Control, FieldValues, Path } from "react-hook-form";

interface TicketAttachmentInputProps<
  TFieldValues extends FieldValues = FieldValues,
> {
  control: Control<TFieldValues>;
  name?: Path<TFieldValues>;
  disabled?: boolean;
  maxFiles?: number;
}

export const TicketAttachmentInput = <
  TFieldValues extends FieldValues = FieldValues,
>({
  control,
  name = "attachments" as Path<TFieldValues>,
  disabled = false,
  maxFiles = 3,
}: TicketAttachmentInputProps<TFieldValues>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-background/80 font-semibold">
            Attachments (Optional, Max {maxFiles} Photos)
          </FormLabel>
          <FormControl>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="border-muted text-foreground hover:bg-muted hover:text-foreground/70 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={disabled || (field.value?.length || 0) >= maxFiles}
                  onClick={() =>
                    document.getElementById(`file-upload-${name}`)?.click()
                  }
                >
                  <Paperclip className="size-4 mr-2" /> Choose Image
                </Button>
                <span className="text-xs text-muted-foreground hidden sm:inline-block">
                  Format: JPG, PNG, WEBP (Max 5MB)
                </span>
                <input
                  id={`file-upload-${name}`}
                  type="file"
                  multiple
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                  className="hidden"
                  onChange={(e) => {
                    const selectedFiles = Array.from(e.target.files || []);
                    const currentFiles = (field.value as File[]) || [];
                    const combinedFiles = [
                      ...currentFiles,
                      ...selectedFiles,
                    ].slice(0, maxFiles);
                    field.onChange(combinedFiles);
                    e.target.value = "";
                  }}
                />
              </div>

              {field.value && (field.value as File[]).length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(field.value as File[]).map((file: File, index: number) => (
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
                        disabled={disabled}
                        onClick={() => {
                          const newFiles = (field.value as File[]).filter(
                            (_: File, i: number) => i !== index,
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
  );
};
