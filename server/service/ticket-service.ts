import { ResponseError } from "../error/response-error";
import type { CheckDataExist } from "../model/general-model";
import {
  toTicketResponse,
  type CreateTicketRequest,
  type DeleteTicketRequest,
  type RestoreTicketRequest,
  type TicketResponse,
  type UpdateTicketRequest,
} from "../model/ticket-model";
import { Status, UserRole, type User } from "../src/generated/prisma/browser";
import type { Prisma, Ticket } from "../src/generated/prisma/client";
import { prismaClient } from "../src/lib/prisma";
import { isValidFile } from "../utils/cloudinary-guard";
import { TicketValidation } from "../validation/ticket-validation";
import { Validation } from "../validation/validation";
import { CloudinaryService } from "./cloudinary-service";

export class TicketService {
  static async create(
    user: User,
    request: CreateTicketRequest,
  ): Promise<TicketResponse> {
    const createRequest = Validation.validate(TicketValidation.CREATE, request);

    const existingTicket = await prismaClient.ticket.findFirst({
      where: {
        submitterId: user.id,
        title: createRequest.title,
        status: {
          in: [Status.SUBMITTED, Status.ONGOING],
        },
      },
    });

    if (existingTicket) {
      throw new ResponseError(
        400,
        "You have already created a ticket with this title which is currently being processed.",
      );
    }

    let attachmentUrls: string[] = [];

    if (request.attachments && request.attachments.length > 0) {
      const sanitizedName = createRequest.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-");

      const uploadPromises = request.attachments.map((file, index) => {
        if (isValidFile(file)) {
          const fileName = `${sanitizedName}-${Date.now()}-${index}`;
          return CloudinaryService.uploadAttachmentTicket(
            file,
            "ticketing-school/attachment",
            fileName,
          );
        }
        return Promise.resolve("");
      });

      const results = await Promise.all(uploadPromises);
      attachmentUrls = results.filter((url) => url !== "");
    }

    const newTicketId = this.generateTicketId();

    const ticket = await prismaClient.ticket.create({
      data: {
        id: newTicketId,
        title: createRequest.title,
        description: createRequest.description,
        attachment_url: attachmentUrls,
        priority: createRequest.priority,
        submitterId: user.id,
      },
      include: {
        submitter: true,
      },
    });

    return toTicketResponse(ticket);
  }

  static async update(
    user: User,
    request: UpdateTicketRequest,
  ): Promise<TicketResponse> {
    const updateRequest = Validation.validate(TicketValidation.UPDATE, request);
    const oldTicket = await this.checkTicketExist({ id: updateRequest.id });

    const isCreator = user.id === oldTicket.submitterId;
    const isAdmin = user.role === UserRole.ADMIN;

    if (!isCreator && !isAdmin) {
      throw new ResponseError(
        403,
        "You do not have permission to update this ticket",
      );
    }

    const updateData: Prisma.TicketUpdateInput = {};

    if (updateRequest.status) {
      if (!isAdmin) {
        throw new ResponseError(
          403,
          "Only Admins are allowed to change the ticket status",
        );
      }
      updateData.status = updateRequest.status;
    }

    if (updateRequest.priority) {
      if (!isAdmin && oldTicket.status !== Status.SUBMITTED) {
        throw new ResponseError(
          403,
          "Cannot update priority when the ticket is already being processed",
        );
      }
      updateData.priority = updateRequest.priority;
    }

    const isUpdatingContent =
      updateRequest.title ||
      updateRequest.description ||
      updateRequest.delete_attachment === true ||
      (request.attachments && request.attachments.length > 0);

    if (isUpdatingContent) {
      if (!isCreator) {
        throw new ResponseError(
          403,
          "As an Admin, you can only update the status and priority of tickets created by other users",
        );
      }

      if (oldTicket.status !== Status.SUBMITTED) {
        throw new ResponseError(
          403,
          "Cannot update ticket details when the status is no longer SUBMITTED",
        );
      }

      if (
        updateRequest.title ||
        updateRequest.description ||
        updateRequest.priority
      ) {
        const titleCheck = updateRequest.title ?? oldTicket.title;
        const descriptionCheck =
          updateRequest.description ?? oldTicket.description;
        const priorityCheck = updateRequest.priority ?? oldTicket.priority;

        const countExistingTicket = await prismaClient.ticket.count({
          where: {
            submitterId: oldTicket.submitterId,
            title: titleCheck,
            description: descriptionCheck,
            priority: priorityCheck,
            NOT: {
              id: oldTicket.id,
            },
          },
        });

        if (countExistingTicket > 0) {
          throw new ResponseError(
            400,
            "A ticket with the exact same details already exists",
          );
        }
      }

      if (updateRequest.title) updateData.title = updateRequest.title;
      if (updateRequest.description)
        updateData.description = updateRequest.description;

      let attachmentUrls = oldTicket.attachment_url;

      if (updateRequest.delete_attachment === true) {
        if (attachmentUrls.length > 0) {
          const deletePromises = attachmentUrls.map((url) =>
            CloudinaryService.deleteImage(url),
          );
          await Promise.all(deletePromises);
        }
        attachmentUrls = [];
      }

      if (request.attachments && request.attachments.length > 0) {
        const sanitizedName = (updateRequest.title ?? oldTicket.title)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-");

        const uploadPromises = request.attachments.map((file, index) => {
          if (isValidFile(file)) {
            const fileName = `${sanitizedName}-${Date.now()}-${index}`;
            return CloudinaryService.uploadAttachmentTicket(
              file,
              "ticketing-school/attachment",
              fileName,
            );
          }
          return Promise.resolve("");
        });

        const newUrls = await Promise.all(uploadPromises);
        const validNewUrls = newUrls.filter((url) => url !== "");

        attachmentUrls = [...attachmentUrls, ...validNewUrls];
      }

      updateData.attachment_url = attachmentUrls;
    }

    const ticket = await prismaClient.ticket.update({
      where: {
        id: request.id,
      },
      data: updateData,
      include: {
        submitter: true,
      },
    });

    return toTicketResponse(ticket);
  }

  static async remove(
    user: User,
    request: DeleteTicketRequest,
  ): Promise<boolean> {
    const deleteRequest = Validation.validate(TicketValidation.DELETE, request);
    const ticket = await this.checkTicketExist({ id: deleteRequest.id });

    const isCreator = user.id === ticket.submitterId;
    const isAdmin = user.role === UserRole.ADMIN;

    if (!isCreator && !isAdmin) {
      throw new ResponseError(
        403,
        "You do not have permission to delete this ticket",
      );
    }

    if (!isAdmin && ticket.status !== Status.SUBMITTED) {
      throw new ResponseError(
        403,
        "Cannot delete ticket when the status is no longer SUBMITTED",
      );
    }

    await prismaClient.ticket.update({
      where: {
        id: ticket.id,
      },
      data: {
        deleted_at: new Date(),
      },
    });

    return true;
  }

  static async restore(
    user: User,
    request: RestoreTicketRequest,
  ): Promise<TicketResponse> {
    if (user.role !== UserRole.ADMIN) {
      throw new ResponseError(
        403,
        "Only Admins are allowed to restore deleted tickets",
      );
    }

    const restoreRequest = Validation.validate(
      TicketValidation.RESTORE,
      request,
    );

    const ticketInTrash = await prismaClient.ticket.findFirst({
      where: {
        id: restoreRequest.id,
        deleted_at: { not: null },
      },
    });

    if (!ticketInTrash) {
      throw new ResponseError(
        404,
        "Ticket not found in trash bin. It might be active or permanently deleted.",
      );
    }

    const restoredTicket = await prismaClient.ticket.update({
      where: {
        id: restoreRequest.id,
      },
      data: {
        deleted_at: null,
      },
      include: {
        submitter: true,
      },
    });

    return toTicketResponse(restoredTicket);
  }

  static async checkTicketExist(request: CheckDataExist): Promise<Ticket> {
    const ticket = await prismaClient.ticket.findUnique({
      where: {
        id: request.id,
        deleted_at: null,
      },
    });

    if (!ticket) {
      throw new ResponseError(404, "Ticket not found");
    }

    return ticket;
  }

  private static generateTicketId(): string {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);

    const randomNumbers = Math.floor(1000 + Math.random() * 9000);

    return `TKT-${day}${month}${year}-${randomNumbers}`;
  }
}
