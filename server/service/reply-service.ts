import { ResponseError } from "../error/response-error";
import {
  toReplyResponse,
  type CreateReplyRequest,
  type GetRepliesRequest,
  type ReplyResponse,
} from "../model/reply-model";
import { Status, UserRole, type User } from "../src/generated/prisma/client";
import { prismaClient } from "../src/lib/prisma";
import { ReplyValidation } from "../validation/reply-validation";
import { Validation } from "../validation/validation";

export class ReplyService {
  static async create(
    user: User,
    request: CreateReplyRequest,
  ): Promise<ReplyResponse> {
    // 1. Validate incoming payload data structure using Zod schema
    const createRequest = Validation.validate(ReplyValidation.CREATE, request);

    // 2. Fetch the target ticket to verify its existence
    const ticket = await prismaClient.ticket.findUnique({
      where: {
        id: createRequest.ticketId,
      },
    });

    // Integrity Guard: Block operations if ticket doesn't exist or is soft-deleted
    if (!ticket || ticket.deleted_at !== null) {
      throw new ResponseError(404, "Ticket not found or has been deleted.");
    }

    // Security Guard: Teachers can only reply to their own tickets (Admins can reply to any)
    if (user.role === UserRole.TEACHER && ticket.submitterId !== user.id) {
      throw new ResponseError(
        403,
        "You do not have permission to reply to this ticket.",
      );
    }

    // Business Rule Guard: Conversations are locked once a ticket is finalized (DONE/REJECTED)
    if (ticket.status === Status.DONE || ticket.status === Status.REJECTED) {
      throw new ResponseError(
        400,
        "Cannot reply to a resolved or rejected ticket.",
      );
    }

    // 3. Persist the reply message to the database
    const reply = await prismaClient.ticketReply.create({
      data: {
        message: createRequest.message,
        ticketId: ticket.id,
        senderId: user.id,
      },
      include: {
        sender: true,
      },
    });

    // 4. Transform database record into clean API Response payload
    return toReplyResponse(reply);
  }

  static async get(
    user: User,
    request: GetRepliesRequest,
  ): Promise<ReplyResponse[]> {
    // 1. Validate query/route parameters using Zod schema
    const getRequest = Validation.validate(ReplyValidation.GET, request);

    // 2. Fetch the target ticket to verify status before revealing timeline
    const ticket = await prismaClient.ticket.findUnique({
      where: {
        id: getRequest.ticketId,
      },
    });

    // Integrity Guard: Block access if ticket doesn't exist or is soft-deleted
    if (!ticket || ticket.deleted_at !== null) {
      throw new ResponseError(404, "Ticket not found or has been deleted.");
    }

    // Privacy Guard: Prevent non-author teachers from viewing private ticket discussion logs
    if (user.role === UserRole.TEACHER && ticket.submitterId !== user.id) {
      throw new ResponseError(
        403,
        "You do not have permission to view replies for this ticket.",
      );
    }

    // 3. Fetch all related replies arranged from oldest to newest (ascending timeline)
    const replies = await prismaClient.ticketReply.findMany({
      where: {
        ticketId: ticket.id,
      },
      include: {
        sender: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // 4. Map the array of database models to clean response DTOs
    return replies.map((reply) => toReplyResponse(reply));
  }
}
