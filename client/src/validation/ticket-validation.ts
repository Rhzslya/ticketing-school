import { Priority, Status, TicketCategory } from "@/enum/ticket";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/utils/image-type";
import z from "zod";

const PRIORITY_VALUES = Object.values(Priority) as [string, ...string[]];
const STATUS_VALUES = Object.values(Status) as [string, ...string[]];
const CATEGORY_VALUES = Object.values(TicketCategory) as [string, ...string[]];

export class TicketValidation {
  static readonly CREATE = z.object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(100, "Title is too long (max 100 characters)"),

    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    attachments: z
      .array(
        z
          .instanceof(File)
          .refine((file) => file.size <= MAX_FILE_SIZE)
          .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type)),
      )
      .max(3, "Maximum only 3 image")
      .optional(),

    priority: z.enum(Priority).default(Priority.LOW),
    category: z.enum(TicketCategory).optional(),
  });

  static readonly UPDATE = z.object({
    id: z.string().regex(/^TKT-\d{6}-\d{4}$/, "Format invalid"),
    title: z.string().min(1, "Title is required").max(100).optional(),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .optional(),
    priority: z.enum(Priority).optional(),
    status: z.enum(Status).optional(),
    category: z.enum(TicketCategory).optional(),

    delete_attachment: z.preprocess(
      (val) => val === "true" || val === true,
      z.boolean().optional(),
    ),
    attachments: z
      .array(
        z
          .instanceof(File)
          .refine((file) => file.size <= MAX_FILE_SIZE)
          .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type)),
      )
      .max(3, "Maximum only 3 image")
      .optional(),
  });

  static readonly SEARCH = z.object({
    keyword: z.string().min(1).max(100).optional(),
    priority: z.enum(PRIORITY_VALUES).optional(),
    status: z.enum(STATUS_VALUES).optional(),
    category: z.enum(CATEGORY_VALUES).optional(),
    submitterId: z.coerce.number().positive().optional(),
    is_deleted: z.preprocess((val) => {
      if (typeof val === "string") return val === "true";
      return Boolean(val);
    }, z.boolean().optional()),
    page: z.coerce.number().min(1).default(1),
    size: z.coerce.number().min(1).max(100).default(10),
    sortBy: z
      .enum(["createdAt", "updatedAt", "priority", "status", "category"])
      .optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  });

  static readonly DELETE = z.object({
    id: z.string().regex(/^TKT-\d{6}-\d{4}$/, "Format invalid"),
  });

  static readonly RESTORE = z.object({
    id: z.string().regex(/^TKT-\d{6}-\d{4}$/, "Format invalid"),
  });

  static readonly GET = z.object({
    id: z.string().regex(/^TKT-\d{6}-\d{4}$/, "Format invalid"),
  });
}
