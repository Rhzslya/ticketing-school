import type { Priority, Status, TicketCategory } from "@/enum/ticket";
import type { User } from "./user-model";

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
  page: number;
  size: number;
  sortBy?: "createdAt" | "updatedAt" | "priority" | "status" | "category";
  sortOrder?: "asc" | "desc";
  is_deleted?: boolean;
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

export type DeleteTicketResponse = {
  message: string;
};

export function toTicketResponse(
  data: TicketResponse & { submitter: User | null },
): TicketResponse {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    priority: data.priority,
    status: data.status,
    category: data.category,
    attachment_url: data.attachment_url,
    submitterId: data.submitterId,
    submitter: data.submitter
      ? {
          id: data.submitter.id,
          fullName: data.submitter.fullName,
          username: data.submitter.username,
        }
      : null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}
