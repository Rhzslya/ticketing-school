import { ResponseError } from "../error/response-error";
import type { CheckDataExist } from "../model/general-model";
import type { Pageable } from "../model/page-model";
import {
  toTicketResponse,
  type CreateTicketRequest,
  type DeleteTicketRequest,
  type GetDetailedTicketRequest,
  type RestoreTicketRequest,
  type SearchTicketRequest,
  type TicketResponse,
  type TicketStatisticsResponse,
  type UpdateTicketRequest,
} from "../model/ticket-model";
import { Status, UserRole, type User } from "../src/generated/prisma/browser";
import {
  Priority,
  Prisma,
  TicketCategory,
  type Ticket,
} from "../src/generated/prisma/client";
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
    // 1. Validate payload structure using defined Zod schema
    const createRequest = Validation.validate(TicketValidation.CREATE, request);

    // 2. Anti-spam / Duplicate prevention check
    const existingTicket = await prismaClient.ticket.findFirst({
      where: {
        submitterId: user.id,
        title: createRequest.title,
        status: {
          in: [Status.SUBMITTED, Status.ONGOING], // Restrict matching active issues
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

    // 3. Process file attachments if present
    if (request.attachments && request.attachments.length > 0) {
      // Clean title string to create a standard slug structure for assets
      const sanitizedName = createRequest.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-");

      // Execute non-blocking parallel uploads via Promise.all
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

    // 4. Generate unique business tracker identifier
    const newTicketId = this.generateTicketId();

    // 5. Persist record to storage
    const ticket = await prismaClient.ticket.create({
      data: {
        id: newTicketId,
        title: createRequest.title,
        description: createRequest.description,
        attachment_url: attachmentUrls,
        priority: createRequest.priority,
        category: createRequest.category,
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

    // State Guards: Completed or Rejected records must block structural modifications
    if (oldTicket.status === Status.REJECTED) {
      throw new ResponseError(
        403,
        "Cannot update a ticket that has been rejected",
      );
    }

    if (oldTicket.status === Status.DONE) {
      throw new ResponseError(
        403,
        "Cannot update a ticket that is currently already completed (DONE).",
      );
    }

    // Authorization evaluation matrix
    const isCreator = user.id === oldTicket.submitterId;
    const isAdmin = user.role === UserRole.ADMIN;

    if (!isCreator && !isAdmin) {
      throw new ResponseError(
        403,
        "You do not have permission to update this ticket",
      );
    }

    const updateData: Prisma.TicketUpdateInput = {};

    // Administrative Fields: Handle lifecycle progression
    if (updateRequest.status) {
      if (!isAdmin) {
        throw new ResponseError(
          403,
          "Only Admins are allowed to change the ticket status",
        );
      }
      updateData.status = updateRequest.status;
    }

    // Priority updates management
    if (updateRequest.priority) {
      // Teachers can only modify priority during tentative initial submission phases
      if (!isAdmin && oldTicket.status !== Status.SUBMITTED) {
        throw new ResponseError(
          403,
          "Cannot update priority when the ticket is already being processed",
        );
      }
      updateData.priority = updateRequest.priority;
    }

    // Content Mutators: Detect changes to textual fields or functional assets
    const isUpdatingContent =
      (updateRequest.title !== undefined &&
        updateRequest.title !== oldTicket.title) ||
      (updateRequest.description !== undefined &&
        updateRequest.description !== oldTicket.description) ||
      (updateRequest.category !== undefined &&
        updateRequest.category !== oldTicket.category) ||
      updateRequest.delete_attachment === true ||
      (request.attachments && request.attachments.length > 0);

    if (isUpdatingContent) {
      // Restriction: Admins cannot reshape core content provided by standard users
      if (!isCreator) {
        throw new ResponseError(
          403,
          "As an Admin, you can only update the status and priority of tickets created by other users",
        );
      }

      // Lock: Submitter can't modify textual fields if processing is underway
      if (oldTicket.status !== Status.SUBMITTED) {
        throw new ResponseError(
          403,
          "Cannot update ticket details when the status is no longer SUBMITTED",
        );
      }

      // Check collision/duplication metrics if primary fields change
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
      if (updateRequest.category) updateData.category = updateRequest.category;

      let attachmentUrls = oldTicket.attachment_url;

      // Handle file deletion from target remote CDN cluster
      if (updateRequest.delete_attachment === true) {
        if (attachmentUrls.length > 0) {
          const deletePromises = attachmentUrls.map((url) =>
            CloudinaryService.deleteImage(url),
          );
          await Promise.all(deletePromises);
        }
        attachmentUrls = [];
      }

      // Process newly added attachments on update action
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

    // Execute state compilation updates down to ORM layer
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

    // Submitter Guard: Teachers cannot pull down issues already locked in processing stages
    if (!isAdmin && ticket.status !== Status.SUBMITTED) {
      throw new ResponseError(
        403,
        "Cannot delete ticket when the status is no longer SUBMITTED",
      );
    }

    // Perform Soft Delete action
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

    // Look explicitly into soft deleted vectors
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

  static async search(
    user: User,
    request: SearchTicketRequest,
  ): Promise<Pageable<TicketResponse>> {
    const searchRequest = Validation.validate(TicketValidation.SEARCH, request);

    const skip = (searchRequest.page - 1) * searchRequest.size;
    const andFilters: Prisma.TicketWhereInput[] = [];

    // Tenant Check: Teachers can never request or peek records beyond their scope
    if (user.role === UserRole.TEACHER) {
      andFilters.push({ submitterId: user.id });
    } else if (user.role === UserRole.ADMIN && searchRequest.submitterId) {
      andFilters.push({ submitterId: searchRequest.submitterId });
    }

    // Textual case-insensitive search parameters mapping
    if (searchRequest.keyword) {
      andFilters.push({
        OR: [
          { title: { contains: searchRequest.keyword, mode: "insensitive" } },
          {
            description: {
              contains: searchRequest.keyword,
              mode: "insensitive",
            },
          },
        ],
      });
    }

    // Enumerated relational filter bindings
    if (searchRequest.priority) {
      andFilters.push({ priority: searchRequest.priority as Priority });
    }

    if (searchRequest.status) {
      andFilters.push({ status: searchRequest.status as Status });
    }

    if (searchRequest.category) {
      andFilters.push({ category: searchRequest.category as TicketCategory });
    }

    // Define structural aggregation parameters
    const whereClause: Prisma.TicketWhereInput = {
      deleted_at: searchRequest.is_deleted ? { not: null } : null,
      AND: andFilters.length > 0 ? andFilters : undefined,
    };

    // Execute concurrently across an atomic database transaction
    const [tickets, totalItems] = await prismaClient.$transaction([
      prismaClient.ticket.findMany({
        where: whereClause,
        take: searchRequest.size,
        skip: skip,
        orderBy: {
          [searchRequest.sortBy || "createdAt"]:
            searchRequest.sortOrder || "desc",
        },
        include: {
          submitter: true,
        },
      }),
      prismaClient.ticket.count({
        where: whereClause,
      }),
    ]);

    return {
      data: tickets.map((ticket) => toTicketResponse(ticket)),
      paging: {
        size: searchRequest.size,
        current_page: searchRequest.page,
        total_page: Math.ceil(totalItems / searchRequest.size),
      },
    };
  }

  static async getStatistics(user: User): Promise<TicketStatisticsResponse> {
    const baseWhereClause: Prisma.TicketWhereInput = {
      deleted_at: null,
    };

    // Secure data-isolation logic: limit calculation vectors for non-administrative roles
    if (user.role === UserRole.TEACHER) {
      baseWhereClause.submitterId = user.id;
    }

    // Optimized isolated batch counts executing on internal parallel thread pools
    const [
      total,
      statusSubmitted,
      statusOngoing,
      statusDone,
      statusRejected,
      priorityLow,
      priorityMedium,
      priorityHigh,
      categoryNetwork,
      categoryHardware,
      categorySoftware,
      categoryElectrical,
      categoryFacilities,
      categoryOthers,
    ] = await prismaClient.$transaction([
      prismaClient.ticket.count({ where: baseWhereClause }),

      // Counts segmented by current status
      prismaClient.ticket.count({
        where: { ...baseWhereClause, status: Status.SUBMITTED },
      }),
      prismaClient.ticket.count({
        where: { ...baseWhereClause, status: Status.ONGOING },
      }),
      prismaClient.ticket.count({
        where: { ...baseWhereClause, status: Status.DONE },
      }),
      prismaClient.ticket.count({
        where: { ...baseWhereClause, status: Status.REJECTED },
      }),

      // Counts segmented by impact priority
      prismaClient.ticket.count({
        where: { ...baseWhereClause, priority: Priority.LOW },
      }),
      prismaClient.ticket.count({
        where: { ...baseWhereClause, priority: Priority.MEDIUM },
      }),
      prismaClient.ticket.count({
        where: { ...baseWhereClause, priority: Priority.HIGH },
      }),

      // Counts segmented by functional infrastructural categorization
      prismaClient.ticket.count({
        where: { ...baseWhereClause, category: TicketCategory.NETWORK },
      }),
      prismaClient.ticket.count({
        where: { ...baseWhereClause, category: TicketCategory.HARDWARE },
      }),
      prismaClient.ticket.count({
        where: { ...baseWhereClause, category: TicketCategory.SOFTWARE },
      }),
      prismaClient.ticket.count({
        where: { ...baseWhereClause, category: TicketCategory.ELECTRICAL },
      }),
      prismaClient.ticket.count({
        where: { ...baseWhereClause, category: TicketCategory.FACILITIES },
      }),
      prismaClient.ticket.count({
        where: { ...baseWhereClause, category: TicketCategory.OTHERS },
      }),
    ]);

    return {
      total,
      byStatus: {
        SUBMITTED: statusSubmitted,
        ONGOING: statusOngoing,
        DONE: statusDone,
        REJECTED: statusRejected,
      },
      byPriority: {
        LOW: priorityLow,
        MEDIUM: priorityMedium,
        HIGH: priorityHigh,
      },
      byCategory: {
        NETWORK: categoryNetwork,
        HARDWARE: categoryHardware,
        SOFTWARE: categorySoftware,
        ELECTRICAL: categoryElectrical,
        FACILITIES: categoryFacilities,
        OTHERS: categoryOthers,
      },
    };
  }

  /**
   * Retrieves full details of a specific ticket, protected by standard security scopes.
   */
  static async get(
    user: User,
    request: GetDetailedTicketRequest,
  ): Promise<TicketResponse> {
    const getRequest = Validation.validate(TicketValidation.GET, request);

    const ticket = await prismaClient.ticket.findFirst({
      where: {
        id: getRequest.id,
        deleted_at: null,
      },
      include: {
        submitter: true,
      },
    });

    if (!ticket) {
      throw new ResponseError(404, "Ticket not found");
    }

    // Scope Guard: Enforce access barriers so teachers cannot access other users' data
    if (user.role === UserRole.TEACHER && ticket.submitterId !== user.id) {
      throw new ResponseError(
        403,
        "You do not have permission to access this ticket",
      );
    }

    return toTicketResponse(ticket);
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
