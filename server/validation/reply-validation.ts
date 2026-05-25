import { z } from "zod";

export class ReplyValidation {
  static readonly CREATE = z.object({
    ticketId: z.string().regex(/^TKT-\d{6}-\d{4}$/, "Invalid Ticket ID format"),
    message: z
      .string()
      .min(1, "Message cannot be empty")
      .max(1000, "Message is too long. Maximum 1000 characters."),
  });

  static readonly GET = z.object({
    ticketId: z.string().regex(/^TKT-\d{6}-\d{4}$/, "Format invalid"),
  });
}
