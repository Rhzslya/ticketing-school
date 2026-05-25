import type { Context } from "hono";
import { Priority, TicketCategory } from "../src/generated/prisma/enums";
import { AiService } from "../service/ai-service";

export class AiAnalayzeController {
  static async analyze(c: Context) {
    try {
      const body = (await c.req.json()) as { description: string };

      if (!body.description || body.description.trim() === "") {
        return c.json({
          data: { priority: Priority.LOW, category: TicketCategory.OTHERS },
        });
      }

      const aiResult = await AiService.analyzeTicket(body.description);

      return c.json({ data: aiResult });
    } catch (error) {
      return c.json({
        data: { priority: Priority.LOW, category: TicketCategory.OTHERS },
      });
    }
  }
}
