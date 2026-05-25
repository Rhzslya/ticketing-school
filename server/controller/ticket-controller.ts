import type { Context } from "hono";
import {
  Priority,
  TicketCategory,
  type Status,
  type User,
} from "../src/generated/prisma/client";
import type {
  CreateTicketRequest,
  SearchTicketRequest,
  UpdateTicketRequest,
} from "../model/ticket-model";
import { ResponseError } from "../error/response-error";
import { TicketService } from "../service/ticket-service";

export class TicketController {
  static async create(c: Context) {
    try {
      const user = c.var.user as User;

      let request: CreateTicketRequest = {} as CreateTicketRequest;
      const contentType = c.req.header("Content-Type") || "";

      if (contentType.includes("application/json")) {
        request = await c.req.json();
      } else if (contentType.includes("multipart/form-data")) {
        const body = await c.req.parseBody({ all: true });

        request = {
          title: body.title as string,
          description: body.description as string,
          priority: body.priority as Priority,
          category: body.category as TicketCategory,
        };

        if (body.attachments) {
          request.attachments = Array.isArray(body.attachments)
            ? (body.attachments as File[])
            : ([body.attachments] as File[]);
        }
      } else {
        throw new ResponseError(
          400,
          "Content-Type must be application/json or multipart/form-data",
        );
      }

      const response = await TicketService.create(user, request);

      return c.json({ data: response });
    } catch (error) {
      throw error;
    }
  }

  static async update(c: Context) {
    try {
      const user = c.var.user as User;
      const id = c.req.param("id") as string;

      let request: UpdateTicketRequest = {} as UpdateTicketRequest;
      const contentType = c.req.header("Content-Type") || "";

      if (contentType.includes("application/json")) {
        request = await c.req.json();
        request.id = id;
      } else if (contentType.includes("multipart/form-data")) {
        const body = await c.req.parseBody({ all: true });

        request = {
          id: id,
          title: body.title as string,
          description: body.description as string,
          priority: body.priority as Priority,
          status: body.status as Status,
          category: body.category as TicketCategory,

          delete_attachment: body.delete_attachment === "true",
        };

        if (body.attachments) {
          request.attachments = Array.isArray(body.attachments)
            ? (body.attachments as File[])
            : ([body.attachments] as File[]);
        }
      } else {
        throw new ResponseError(
          400,
          "Content-Type must be application/json or multipart/form-data",
        );
      }

      const response = await TicketService.update(user, request);

      return c.json({ data: response });
    } catch (error) {
      throw error;
    }
  }

  static async remove(c: Context) {
    try {
      const user = c.var.user as User;
      const id = c.req.param("id") as string;

      await TicketService.remove(user, { id });

      return c.json({
        data: true,
        message: `Ticket With ID ${id} deleted successfully`,
      });
    } catch (error) {
      throw error;
    }
  }

  static async restore(c: Context) {
    try {
      const user = c.var.user as User;
      const id = c.req.param("id") as string;

      const response = await TicketService.restore(user, { id });

      return c.json({ data: response });
    } catch (error) {
      throw error;
    }
  }

  static async search(c: Context) {
    try {
      const user = c.var.user as User;

      const request: SearchTicketRequest = {
        keyword: c.req.query("keyword"),

        priority: c.req.query("priority") as Priority,
        status: c.req.query("status") as Status,
        category: c.req.query("category") as TicketCategory,

        submitterId: c.req.query("submitterId")
          ? Number(c.req.query("submitterId"))
          : undefined,

        is_deleted: c.req.query("is_deleted")
          ? c.req.query("is_deleted") === "true"
          : undefined,

        page: c.req.query("page") ? Number(c.req.query("page")) : 1,
        size: c.req.query("size") ? Number(c.req.query("size")) : 10,

        sortBy: c.req.query("sortBy") as
          | "createdAt"
          | "updatedAt"
          | "priority"
          | "status"
          | "category",
        sortOrder: c.req.query("sortOrder") as "asc" | "desc",
      };

      const response = await TicketService.search(user, request);

      return c.json(response);
    } catch (error) {
      throw error;
    }
  }
  static async get(c: Context) {
    try {
      const user = c.var.user as User;
      const id = c.req.param("id") as string;

      const response = await TicketService.get(user, { id });

      return c.json({ data: response });
    } catch (error) {
      throw error;
    }
  }

  static async getStatistics(c: Context) {
    try {
      const user = c.var.user as User;

      const response = await TicketService.getStatistics(user);

      return c.json({ data: response });
    } catch (error) {
      throw error;
    }
  }
}
