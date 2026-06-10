import {
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
import { TicketCategory, Priority, Status } from "@/enum/ticket";
import type { Control, FieldValues, Path } from "react-hook-form";

const inputStyle =
  "bg-card-foreground border-muted text-background placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:ring-1";

interface TicketClassificationFieldsProps<
  TFieldValues extends FieldValues = FieldValues,
> {
  control: Control<TFieldValues>;
  disabled?: boolean;
  categoryDisabled?: boolean;
  priorityDisabled?: boolean;
  statusDisabled?: boolean;
  showStatus?: boolean;
}

export const TicketClassificationFields = <
  TFieldValues extends FieldValues = FieldValues,
>({
  control,
  disabled = false,
  categoryDisabled = false,
  priorityDisabled = false,
  statusDisabled = false,
  showStatus = false,
}: TicketClassificationFieldsProps<TFieldValues>) => {
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
    <div
      className={`grid grid-cols-1 ${showStatus ? "md:grid-cols-3" : "md:grid-cols-2"} gap-6`}
    >
      {showStatus && (
        <FormField
          control={control}
          name={"status" as Path<TFieldValues>}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-background/80 font-semibold">
                Status
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={disabled || statusDisabled}
              >
                <FormControl>
                  <SelectTrigger
                    className={`${inputStyle} h-11 sm:h-10 text-base sm:text-sm w-full text-left [&>span]:truncate`}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-card-foreground border-muted text-background">
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <SelectItem
                      key={key}
                      value={key}
                      className="focus:bg-muted focus:text-foreground cursor-pointer"
                    >
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={control}
        name={"category" as Path<TFieldValues>}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-background/80 font-semibold">
              Category
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={disabled || categoryDisabled}
            >
              <FormControl>
                <SelectTrigger
                  className={`${inputStyle} h-11 sm:h-10 text-base sm:text-sm w-full text-left [&>span]:truncate`}
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-card-foreground border-muted text-background">
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem
                    key={key}
                    value={key}
                    className="focus:bg-muted focus:text-foreground cursor-pointer"
                  >
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={"priority" as Path<TFieldValues>}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-background/80 font-semibold">
              Priority
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={disabled || priorityDisabled}
            >
              <FormControl>
                <SelectTrigger
                  className={`${inputStyle} h-11 sm:h-10 text-base sm:text-sm w-full text-left [&>span]:truncate`}
                >
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-card-foreground border-muted text-background">
                {Object.entries(priorityLabels).map(([key, label]) => (
                  <SelectItem
                    key={key}
                    value={key}
                    className="focus:bg-muted focus:text-foreground cursor-pointer"
                  >
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
    </div>
  );
};
