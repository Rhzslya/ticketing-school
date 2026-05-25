import type { Priority, TicketCategory } from "../src/generated/prisma/enums";

export type AnalyzeResponse = {
  priority: Priority;
  category: TicketCategory;
};
