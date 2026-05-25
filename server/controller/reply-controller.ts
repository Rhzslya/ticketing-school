import type { Context } from "hono";
import type { User } from "../src/generated/prisma/client";
import type {
  CreateReplyRequest,
  GetRepliesRequest,
} from "../model/reply-model";
import { ReplyService } from "../service/reply-service";

export class ReplyController {
  static async create(c: Context) {
    try {
      const user = c.var.user as User;

      const ticketId = c.req.param("id") as string;

      const body = (await c.req.json()) as { message: string };

      const request: CreateReplyRequest = {
        ticketId: ticketId,
        message: body.message,
      };

      const response = await ReplyService.create(user, request);

      return c.json({ data: response });
    } catch (error) {
      throw error;
    }
  }

  static async get(c: Context) {
    try {
      const user = c.var.user as User;
      const ticketId = c.req.param("id") as string;

      const request: GetRepliesRequest = {
        ticketId: ticketId,
      };

      const response = await ReplyService.get(user, request);

      return c.json({ data: response });
    } catch (error) {
      throw error;
    }
  }
}
