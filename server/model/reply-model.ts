import type { TicketReply, User } from "../src/generated/prisma/client";

export type CreateReplyRequest = {
  ticketId: string;
  message: string;
};

export type GetRepliesRequest = {
  ticketId: string;
};

export type ReplyResponse = {
  id: string;
  message: string;
  ticketId: string;
  senderId: number;
  createdAt: Date;
  sender: {
    id: number;
    fullName: string;
    role: string;
  };
};

export function toReplyResponse(
  reply: TicketReply & { sender: User },
): ReplyResponse {
  return {
    id: reply.id,
    message: reply.message,
    ticketId: reply.ticketId,
    senderId: reply.senderId,
    createdAt: reply.createdAt,
    sender: {
      id: reply.sender.id,
      fullName: reply.sender.fullName,
      role: reply.sender.role,
    },
  };
}
