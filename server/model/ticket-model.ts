import type { Ticket, User } from "../src/generated/prisma/client";
import type {
  Priority,
  Status,
  TicketCategory,
} from "../src/generated/prisma/enums";

export type TicketResponse = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  category: TicketCategory;
  submitterId: number;
  submitter: {
    id: number;
    fullName: string;
    username: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
  attachment_url: string[] | null;
};

export type CreateTicketRequest = {
  title: string;
  description: string;
  priority?: Priority;
  category?: TicketCategory;
  attachments?: File[];
};

export type UpdateTicketRequest = {
  id: string;
  title?: string;
  description?: string;
  priority?: Priority;
  status?: Status;
  category?: TicketCategory;
  attachments?: File[];
  delete_attachment?: boolean;
};

export type SearchTicketRequest = {
  keyword?: string;
  priority?: Priority;
  status?: Status;
  category?: TicketCategory;
  submitterId?: number;
  is_deleted?: boolean;
  page: number;
  size: number;
  sortBy?: "createdAt" | "updatedAt" | "priority" | "status" | "category";
  sortOrder?: "asc" | "desc";
};

export type TicketStatisticsResponse = {
  total: number;
  byStatus: Record<Status, number>;
  byPriority: Record<Priority, number>;
  byCategory: Record<TicketCategory, number>;
};

export type DeleteTicketRequest = {
  id: string;
};

export type RestoreTicketRequest = {
  id: string;
};

export type GetDetailedTicketRequest = {
  id: string;
};

export function toTicketResponse(
  ticket: Ticket & { submitter: User },
): TicketResponse {
  return {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    priority: ticket.priority,
    status: ticket.status,
    category: ticket.category,
    attachment_url: ticket.attachment_url,
    submitterId: ticket.submitterId,
    submitter: ticket.submitter
      ? {
          id: ticket.submitter.id,
          fullName: ticket.submitter.fullName,
          username: ticket.submitter.username,
        }
      : null,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  };
}
