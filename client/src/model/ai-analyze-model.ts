import type { Priority, TicketCategory } from "@/enum/ticket";

export type AnalyzeResponse = {
  priority: Priority;
  category: TicketCategory;
};
