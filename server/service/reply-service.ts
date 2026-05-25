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
    const createRequest = Validation.validate(ReplyValidation.CREATE, request);

    const ticket = await prismaClient.ticket.findUnique({
      where: {
        id: createRequest.ticketId,
      },
    });

    if (!ticket || ticket.deleted_at !== null) {
      throw new ResponseError(404, "Ticket not found or has been deleted.");
    }

    if (user.role === UserRole.TEACHER && ticket.submitterId !== user.id) {
      throw new ResponseError(
        403,
        "You do not have permission to reply to this ticket.",
      );
    }

    if (ticket.status === Status.DONE || ticket.status === Status.REJECTED) {
      throw new ResponseError(
        400,
        "Cannot reply to a resolved or rejected ticket.",
      );
    }

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

    return toReplyResponse(reply);
  }

  static async get(
    user: User,
    request: GetRepliesRequest,
  ): Promise<ReplyResponse[]> {
    const getRequest = Validation.validate(ReplyValidation.GET, request);

    const ticket = await prismaClient.ticket.findUnique({
      where: {
        id: getRequest.ticketId,
      },
    });

    if (!ticket || ticket.deleted_at !== null) {
      throw new ResponseError(404, "Ticket not found or has been deleted.");
    }

    if (user.role === UserRole.TEACHER && ticket.submitterId !== user.id) {
      throw new ResponseError(
        403,
        "You do not have permission to view replies for this ticket.",
      );
    }

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

    return replies.map((reply) => toReplyResponse(reply));
  }
}
