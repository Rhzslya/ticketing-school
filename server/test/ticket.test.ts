import { describe, afterEach, beforeEach, it, expect } from "bun:test";
import { TestRequest, UserTest } from "./test-utils";
import { logger } from "../src/application/logging";
import { prismaClient } from "../src/lib/prisma";
import type { CreateTicketRequest } from "../model/ticket-model";
import {
  Priority,
  Status,
  TicketCategory,
  UserRole,
} from "../src/generated/prisma/enums";

describe("POST /api/tickets", () => {
  let authToken = "";

  beforeEach(async () => {
    await UserTest.create();

    const loginResponse = await TestRequest.post("/api/auth/login", {
      identifier: "test_teacher@gmail.com",
      password: "@Adm1n5123",
    });

    const loginCookieHeader = loginResponse.headers.get("set-cookie");
    authToken = loginCookieHeader?.split(";")[0]?.split("=")[1] || "";
  });

  afterEach(async () => {
    await prismaClient.ticket.deleteMany({
      where: {
        submitter: { username: "test_teacher" },
      },
    });
    await UserTest.delete();
  });

  it("should create a new ticket successfully with a specific category", async () => {
    const requestBody: CreateTicketRequest = {
      title: "Class 1A Projector Dead",
      description: "Red indicator light is flashing, can't display image.",
      priority: Priority.HIGH,
      category: TicketCategory.HARDWARE,
    };

    const response = await TestRequest.post(
      "/api/tickets",
      requestBody,
      authToken,
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data.id).toBeDefined();
    expect(body.data.title).toBe(requestBody.title);
    expect(body.data.description).toBe(requestBody.description);
    expect(body.data.priority).toBe("HIGH");
    expect(body.data.category).toBe("HARDWARE");
    expect(body.data.status).toBe("SUBMITTED");

    expect(body.data.submitter).toBeDefined();
    expect(body.data.submitter.username).toBe("test_teacher");
  });

  it("should create ticket WITH attachment/image (multipart/form-data)", async () => {
    const formData = new FormData();
    formData.append("title", "Website Error in My PC");
    formData.append("description", "I cannot open website");
    formData.append("priority", Priority.HIGH);
    formData.append("category", TicketCategory.SOFTWARE);

    const highContrastPng =
      "iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAnUlEQVR4nO3RAQ0AAAwCoNm/9DQGHeAgISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhIWGPBf99An77S88AAAAASUVORK5CYII=";

    const imageBuffer = Buffer.from(highContrastPng, "base64");
    const dummyImage = new Blob([imageBuffer], { type: "image/png" });
    const file = new File([dummyImage], "ticket.png", { type: "image/png" });

    formData.append("attachment", file);

    const response = await TestRequest.postMultipart(
      "/api/tickets",
      formData,
      authToken,
    );

    const body = await response.json();
    logger.debug(body);

    if (response.status !== 200) {
      console.log("FULL ERROR RESPONSE:", JSON.stringify(body, null, 2));
    }

    expect(response.status).toBe(200);
    expect(body.data.attachment_url).not.toBe("");
    expect(body.data.category).toBe("SOFTWARE");
  });

  it("should create ticket WITH multi attachment/image (multipart/form-data)", async () => {
    const formData = new FormData();
    formData.append("title", "Multi Image Test");
    formData.append("description", "I have attached 2 photos.");
    formData.append("priority", Priority.MEDIUM);
    formData.append("category", TicketCategory.FACILITIES);

    const highContrastPng =
      "iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAnUlEQVR4nO3RAQ0AAAwCoNm/9DQGHeAgISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhIWGPBf99An77S88AAAAASUVORK5CYII=";

    const dummyImage1 = new Blob([Buffer.from(highContrastPng, "base64")], {
      type: "image/png",
    });
    const file1 = new File([dummyImage1], "ticket1.png", { type: "image/png" });
    formData.append("attachments", file1);

    const dummyImage2 = new Blob([Buffer.from(highContrastPng, "base64")], {
      type: "image/png",
    });
    const file2 = new File([dummyImage2], "ticket2.png", { type: "image/png" });
    formData.append("attachments", file2);

    const response = await TestRequest.postMultipart(
      "/api/tickets",
      formData,
      authToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(Array.isArray(body.data.attachment_url)).toBe(true);
    expect(body.data.attachment_url.length).toBe(2);
    expect(body.data.category).toBe("FACILITIES");
  });

  it("should create a ticket with default LOW priority and OTHERS category if not provided", async () => {
    const requestBody = {
      title: "The AC in the Teacher's Room is Not Cold Enough",
      description:
        "Please technician check the AC freon in the teacher's room on the 2nd floor.",
    };

    const response = await TestRequest.post(
      "/api/tickets",
      requestBody,
      authToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data.priority).toBe("LOW");
    expect(body.data.category).toBe("OTHERS");
  });

  it("should reject ticket creation if category is invalid (Zod Validation)", async () => {
    const requestBody = {
      title: "Broken Chair",
      description: "One of the chairs in the lab is broken.",
      category: "INVALID_CATEGORY_NAME",
    };

    const response = await TestRequest.post(
      "/api/tickets",
      requestBody,
      authToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(400);
    expect(body.errors).toBeDefined();
  });

  it("should reject ticket creation if validation fails (empty title)", async () => {
    const requestBody = {
      title: "",
      description: "Description is there but title is empty",
      category: TicketCategory.HARDWARE,
    };

    const response = await TestRequest.post(
      "/api/tickets",
      requestBody,
      authToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(400);
    expect(body.errors).toBeDefined();
  });

  it("should reject if a ticket with the same title is still active", async () => {
    const requestBody: CreateTicketRequest = {
      title: "Network Lab Computer Broken",
      description: "PC number 5 cannot enter Windows.",
      category: TicketCategory.HARDWARE,
    };

    await TestRequest.post("/api/tickets", requestBody, authToken);

    const response = await TestRequest.post(
      "/api/tickets",
      requestBody,
      authToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(400);
    expect(body.errors).toBe(
      "You have already created a ticket with this title which is currently being processed.",
    );
  });

  it("should reject if user is not authenticated", async () => {
    const requestBody = {
      title: "Try bypassing",
      description: "It should fail because there is no token.",
      category: TicketCategory.NETWORK,
    };

    const response = await TestRequest.post("/api/tickets", requestBody);
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(401);
    expect(body.errors).toBeDefined();
  });
});

describe("PATCH /api/tickets/:id", () => {
  let authToken = "";
  let adminToken = "";
  let userId = 0;
  let adminId = 0;

  beforeEach(async () => {
    await UserTest.create();
    await UserTest.createAdmin();

    const loginResponse = await TestRequest.post("/api/auth/login", {
      identifier: "test_teacher@gmail.com",
      password: "@Adm1n5123",
    });
    authToken =
      loginResponse.headers.get("set-cookie")?.split(";")[0]?.split("=")[1] ||
      "";

    const adminLoginResponse = await TestRequest.post("/api/auth/login", {
      identifier: "test_admin@gmail.com",
      password: "@Adm1n5123",
    });
    adminToken =
      adminLoginResponse.headers
        .get("set-cookie")
        ?.split(";")[0]
        ?.split("=")[1] || "";

    const user = await prismaClient.user.findUnique({
      where: { username: "test_teacher" },
    });
    if (user) userId = user.id;

    const admin = await prismaClient.user.findUnique({
      where: { username: "test_admin" },
    });
    if (admin) adminId = admin.id;
  });

  afterEach(async () => {
    await prismaClient.ticket.deleteMany({
      where: {
        submitter: {
          username: {
            in: ["test_teacher", "hacker_teacher", "test_admin"],
          },
        },
      },
    });

    await UserTest.delete();

    await prismaClient.user.deleteMany({
      where: { username: "hacker_teacher" },
    });
  });

  it("should update ticket details successfully including category (JSON)", async () => {
    const ticket = await prismaClient.ticket.create({
      data: {
        id: "TKT-111111-1001",
        title: "Old Title",
        description: "Old Description",
        priority: Priority.LOW,
        category: TicketCategory.OTHERS,
        submitterId: userId,
      },
    });

    const requestBody = {
      title: "Updated Title",
      description: "Updated Description",
      priority: Priority.HIGH,
      category: TicketCategory.NETWORK,
    };

    const response = await TestRequest.patch(
      `/api/tickets/${ticket.id}`,
      requestBody,
      authToken,
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data.title).toBe("Updated Title");
    expect(body.data.description).toBe("Updated Description");
    expect(body.data.priority).toBe("HIGH");
    expect(body.data.category).toBe("NETWORK");
  });

  it("should allow update without making any changes (duplicate bypass check)", async () => {
    const ticket = await prismaClient.ticket.create({
      data: {
        id: "TKT-111111-1002",
        title: "Exact Same Title",
        description: "Exact Same Description",
        priority: Priority.MEDIUM,
        category: TicketCategory.HARDWARE,
        submitterId: userId,
      },
    });

    const requestBody = {
      title: "Exact Same Title",
      description: "Exact Same Description",
      category: TicketCategory.HARDWARE,
    };

    const response = await TestRequest.patch(
      `/api/tickets/${ticket.id}`,
      requestBody,
      authToken,
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data.title).toBe("Exact Same Title");
    expect(body.data.category).toBe("HARDWARE");
  });

  it("should reject update if ticket status is not SUBMITTED", async () => {
    const ticket = await prismaClient.ticket.create({
      data: {
        id: "TKT-111111-1003",
        title: "Processing Ticket",
        description: "This ticket is already being handled.",
        priority: Priority.HIGH,
        status: Status.ONGOING,
        submitterId: userId,
      },
    });

    const requestBody = {
      title: "Try to change title",
    };

    const response = await TestRequest.patch(
      `/api/tickets/${ticket.id}`,
      requestBody,
      authToken,
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(403);
    expect(body.errors).toBeDefined();
  });

  it("should reject update if trying to update someone else's ticket", async () => {
    const otherUser = await prismaClient.user.create({
      data: {
        email: "hacker_teacher@gmail.com",
        username: "hacker_teacher",
        password: await Bun.password.hash("@Hashed_password123", {
          algorithm: "bcrypt",
        }),
        fullName: "Hacker Teacher",
        role: UserRole.TEACHER,
      },
    });

    const ticket = await prismaClient.ticket.create({
      data: {
        id: "TKT-111111-1004",
        title: "Someone Else's Ticket",
        description: "Do not touch",
        priority: Priority.LOW,
        submitterId: otherUser.id,
      },
    });

    const response = await TestRequest.patch(
      `/api/tickets/${ticket.id}`,
      { title: "Hacked Title" },
      authToken,
    );

    expect(response.status).toBe(403);
  });

  it("should update ticket WITH new attachments, category, and delete_attachment flag (multipart)", async () => {
    const ticket = await prismaClient.ticket.create({
      data: {
        id: "TKT-111111-1005",
        title: "Image Test",
        description: "Testing image upload",
        priority: Priority.LOW,
        submitterId: userId,
        attachment_url: ["https://old-image.com/img.png"],
      },
    });

    const formData = new FormData();
    formData.append("title", "Image Test Updated");
    formData.append("category", TicketCategory.SOFTWARE);
    formData.append("delete_attachment", "true");

    const highContrastPng =
      "iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAnUlEQVR4nO3RAQ0AAAwCoNm/9DQGHeAgISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhISFhIWGPBf99An77S88AAAAASUVORK5CYII=";

    const dummyImage = new Blob([Buffer.from(highContrastPng, "base64")], {
      type: "image/png",
    });
    const file = new File([dummyImage], "new-ticket.png", {
      type: "image/png",
    });

    formData.append("attachments", file);

    const response = await TestRequest.patchMultipart(
      `/api/tickets/${ticket.id}`,
      formData,
      authToken,
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data.title).toBe("Image Test Updated");
    expect(body.data.category).toBe("SOFTWARE");
    expect(Array.isArray(body.data.attachment_url)).toBe(true);
    expect(body.data.attachment_url.length).toBeGreaterThan(0);
  });

  it("should allow ADMIN to update status and priority of any ticket", async () => {
    const ticket = await prismaClient.ticket.create({
      data: {
        id: "TKT-111111-1006",
        title: "Projector Issue",
        description: "Need immediate fix",
        priority: Priority.MEDIUM,
        status: Status.ONGOING,
        submitterId: userId,
      },
    });

    const requestBody = {
      status: Status.DONE,
      priority: Priority.HIGH,
    };

    const response = await TestRequest.patch(
      `/api/tickets/${ticket.id}`,
      requestBody,
      adminToken,
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data.status).toBe("DONE");
    expect(body.data.priority).toBe("HIGH");
  });

  it("should REJECT title and description updates if performed by ADMIN on other user's ticket", async () => {
    const ticket = await prismaClient.ticket.create({
      data: {
        id: "TKT-111111-1007",
        title: "Original Ticket Title",
        description: "Original Ticket Description",
        priority: Priority.LOW,
        submitterId: userId,
      },
    });

    const requestBody = {
      title: "Hacked by Admin",
      description: "Changed by Admin",
    };

    const response = await TestRequest.patch(
      `/api/tickets/${ticket.id}`,
      requestBody,
      adminToken,
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(403);
    expect(body.errors).toBe(
      "As an Admin, you can only update the status and priority of tickets created by other users",
    );
  });

  it("should allow ADMIN to update everything if they created the ticket themselves", async () => {
    const ticket = await prismaClient.ticket.create({
      data: {
        id: "TKT-111111-1008",
        title: "Admin Server Error",
        description: "Server is down",
        priority: Priority.HIGH,
        submitterId: adminId,
      },
    });

    const requestBody = {
      title: "Admin Server Recovered",
      status: Status.DONE,
      category: TicketCategory.NETWORK,
    };

    const response = await TestRequest.patch(
      `/api/tickets/${ticket.id}`,
      requestBody,
      adminToken,
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data.title).toBe("Admin Server Recovered");
    expect(body.data.status).toBe("DONE");
    expect(body.data.category).toBe("NETWORK");
  });

  it("should reject ticket update if category is invalid (Zod Validation)", async () => {
    const ticket = await prismaClient.ticket.create({
      data: {
        id: "TKT-111111-1009",
        title: "Invalid Category Test",
        description: "Testing faulty input",
        submitterId: userId,
      },
    });

    const requestBody = {
      category: "CATEGORY_UNKNOWN",
    };

    const response = await TestRequest.patch(
      `/api/tickets/${ticket.id}`,
      requestBody,
      authToken,
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(400);
    expect(body.errors).toBeDefined();
  });

  it("should return 404 when ticket ID does not exist", async () => {
    const fakeTicketId = "TKT-999999-9999";

    const response = await TestRequest.patch(
      `/api/tickets/${fakeTicketId}`,
      { priority: Priority.HIGH },
      authToken,
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(404);
    expect(body.errors).toBeDefined();
  });

  it("should return 400 when ticket ID format is invalid", async () => {
    const invalidId = "TICKET-ASAL-ASALAN";

    const response = await TestRequest.patch(
      `/api/tickets/${invalidId}`,
      { priority: Priority.HIGH },
      authToken,
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(400);
    expect(body.errors).toBeDefined();
  });
});

describe("DELETE /api/tickets/:id", () => {
  let authToken = "";
  let adminToken = "";
  let userId = 0;

  beforeEach(async () => {
    await UserTest.create();
    await UserTest.createAdmin();

    const loginResponse = await TestRequest.post("/api/auth/login", {
      identifier: "test_teacher@gmail.com",
      password: "@Adm1n5123",
    });
    authToken =
      loginResponse.headers.get("set-cookie")?.split(";")[0]?.split("=")[1] ||
      "";

    const adminLoginResponse = await TestRequest.post("/api/auth/login", {
      identifier: "test_admin@gmail.com",
      password: "@Adm1n5123",
    });
    adminToken =
      adminLoginResponse.headers
        .get("set-cookie")
        ?.split(";")[0]
        ?.split("=")[1] || "";

    const user = await prismaClient.user.findUnique({
      where: { username: "test_teacher" },
    });
    if (user) userId = user.id;
  });

  afterEach(async () => {
    await prismaClient.ticket.deleteMany({
      where: {
        submitter: {
          username: { in: ["test_teacher", "hacker_teacher", "test_admin"] },
        },
      },
    });
    await UserTest.delete();
    await prismaClient.user.deleteMany({
      where: { username: "hacker_teacher" },
    });
  });

  it("should allow creator (Teacher) to delete their own SUBMITTED ticket", async () => {
    const ticket = await prismaClient.ticket.create({
      data: {
        id: "TKT-222222-2001",
        title: "Delete Test Teacher",
        description: "Will be deleted",
        priority: Priority.LOW,
        status: Status.SUBMITTED,
        submitterId: userId,
      },
    });

    const response = await TestRequest.delete(
      `/api/tickets/${ticket.id}/delete`,
      authToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data).toBe(true);

    const checkTicket = await prismaClient.ticket.findUnique({
      where: { id: ticket.id },
    });
    expect(checkTicket?.deleted_at).not.toBeNull();
  });

  it("should reject creator (Teacher) from deleting their ticket if it is already ONGOING", async () => {
    const ticket = await prismaClient.ticket.create({
      data: {
        id: "TKT-222222-2002",
        title: "Ongoing Ticket",
        description: "Cannot be deleted by teacher",
        priority: Priority.LOW,
        status: Status.ONGOING,
        submitterId: userId,
      },
    });

    const response = await TestRequest.delete(
      `/api/tickets/${ticket.id}/delete`,
      authToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(403);
    expect(body.errors).toBe(
      "Cannot delete ticket when the status is no longer SUBMITTED",
    );
  });

  it("should allow ADMIN to delete any ticket regardless of status", async () => {
    const ticket = await prismaClient.ticket.create({
      data: {
        id: "TKT-222222-2003",
        title: "Admin Delete Test",
        description: "Admin power",
        priority: Priority.HIGH,
        status: Status.ONGOING,
        submitterId: userId,
      },
    });

    const response = await TestRequest.delete(
      `/api/tickets/${ticket.id}/delete`,
      adminToken,
    );

    expect(response.status).toBe(200);
  });

  it("should reject deletion if user tries to delete someone else's ticket", async () => {
    const otherUser = await prismaClient.user.create({
      data: {
        email: "hacker_teacher@gmail.com",
        username: "hacker_teacher",
        password: await Bun.password.hash("@Hashed_password123", {
          algorithm: "bcrypt",
        }),
        fullName: "Hacker",
        role: UserRole.TEACHER,
      },
    });

    const ticket = await prismaClient.ticket.create({
      data: {
        id: "TKT-222222-2004",
        title: "Someone Else's Ticket",
        description: "Do not touch",
        submitterId: otherUser.id,
      },
    });

    const response = await TestRequest.delete(
      `/api/tickets/${ticket.id}/delete`,
      authToken,
    );
    expect(response.status).toBe(403);
  });
});

describe("PATCH /api/tickets/:id/restore", () => {
  let authToken = "";
  let adminToken = "";
  let userId = 0;

  beforeEach(async () => {
    await UserTest.create();
    await UserTest.createAdmin();

    const loginResponse = await TestRequest.post("/api/auth/login", {
      identifier: "test_teacher@gmail.com",
      password: "@Adm1n5123",
    });
    authToken =
      loginResponse.headers.get("set-cookie")?.split(";")[0]?.split("=")[1] ||
      "";

    const adminLoginResponse = await TestRequest.post("/api/auth/login", {
      identifier: "test_admin@gmail.com",
      password: "@Adm1n5123",
    });
    adminToken =
      adminLoginResponse.headers
        .get("set-cookie")
        ?.split(";")[0]
        ?.split("=")[1] || "";

    const user = await prismaClient.user.findUnique({
      where: { username: "test_teacher" },
    });
    if (user) userId = user.id;
  });

  afterEach(async () => {
    await prismaClient.ticket.deleteMany({
      where: {
        submitter: { username: { in: ["test_teacher", "test_admin"] } },
      },
    });
    await UserTest.delete();
  });

  it("should allow ADMIN to successfully restore a soft-deleted ticket", async () => {
    const ticket = await prismaClient.ticket.create({
      data: {
        id: "TKT-333333-3001",
        title: "Deleted Ticket",
        description: "In the trash",
        priority: Priority.LOW,
        submitterId: userId,
        deleted_at: new Date(),
      },
    });

    const response = await TestRequest.patch(
      `/api/tickets/${ticket.id}/restore`,
      {},
      adminToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data.id).toBe(ticket.id);

    const checkTicket = await prismaClient.ticket.findUnique({
      where: { id: ticket.id },
    });
    expect(checkTicket?.deleted_at).toBeNull();
  });

  it("should REJECT non-admin users (Teacher) from restoring a ticket", async () => {
    const ticket = await prismaClient.ticket.create({
      data: {
        id: "TKT-333333-3002",
        title: "Deleted Ticket 2",
        description: "In the trash",
        submitterId: userId,
        deleted_at: new Date(),
      },
    });

    const response = await TestRequest.patch(
      `/api/tickets/${ticket.id}/restore`,
      {},
      authToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(403);
    expect(body.errors).toBe(
      "Only Admins are allowed to restore deleted tickets",
    );
  });

  it("should return 404 if trying to restore an active ticket (not in trash)", async () => {
    const ticket = await prismaClient.ticket.create({
      data: {
        id: "TKT-333333-3003",
        title: "Active Ticket",
        description: "Never deleted",
        submitterId: userId,
        deleted_at: null,
      },
    });

    const response = await TestRequest.patch(
      `/api/tickets/${ticket.id}/restore`,
      {},
      adminToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(404);
    expect(body.errors).toBe(
      "Ticket not found in trash bin. It might be active or permanently deleted.",
    );
  });
});

describe("GET /api/tickets", () => {
  let authToken = "";
  let adminToken = "";
  let userId = 0;
  let user2Id = 0;

  beforeEach(async () => {
    await UserTest.create();
    await UserTest.createAdmin();

    const user2 = await prismaClient.user.create({
      data: {
        email: "teacher2@gmail.com",
        username: "teacher_2",
        password: await Bun.password.hash("@Adm1n5123", {
          algorithm: "bcrypt",
        }),
        fullName: "Teacher 2",
        role: UserRole.TEACHER,
      },
    });
    user2Id = user2.id;

    const loginResponse = await TestRequest.post("/api/auth/login", {
      identifier: "test_teacher@gmail.com",
      password: "@Adm1n5123",
    });
    authToken =
      loginResponse.headers.get("set-cookie")?.split(";")[0]?.split("=")[1] ||
      "";

    const adminLoginResponse = await TestRequest.post("/api/auth/login", {
      identifier: "test_admin@gmail.com",
      password: "@Adm1n5123",
    });
    adminToken =
      adminLoginResponse.headers
        .get("set-cookie")
        ?.split(";")[0]
        ?.split("=")[1] || "";

    const user = await prismaClient.user.findUnique({
      where: { username: "test_teacher" },
    });
    if (user) userId = user.id;

    await prismaClient.ticket.createMany({
      data: [
        {
          id: "TKT-000000-1001",
          title: "Broken Projector",
          description: "Red indicator light is on",
          priority: Priority.HIGH,
          status: Status.SUBMITTED,
          category: TicketCategory.HARDWARE,
          submitterId: userId,
        },
        {
          id: "TKT-000000-1002",
          title: "Teacher's Room AC Not Cold",
          description: "Please check the AC freon",
          priority: Priority.LOW,
          status: Status.ONGOING,
          category: TicketCategory.FACILITIES,
          submitterId: userId,
        },
        {
          id: "TKT-000000-1003",
          title: "Internet Disconnected",
          description: "LAN cable is damaged",
          priority: Priority.MEDIUM,
          status: Status.SUBMITTED,
          category: TicketCategory.NETWORK,
          submitterId: user2Id,
        },
        {
          id: "TKT-000000-1004",
          title: "Broken Mouse",
          description: "Left click is not responding",
          priority: Priority.LOW,
          status: Status.SUBMITTED,
          category: TicketCategory.HARDWARE,
          submitterId: userId,
          deleted_at: new Date(),
        },
      ],
    });
  });

  afterEach(async () => {
    await prismaClient.ticket.deleteMany({
      where: {
        submitter: {
          username: { in: ["test_teacher", "teacher_2", "test_admin"] },
        },
      },
    });
    await UserTest.delete();
    await prismaClient.user.deleteMany({ where: { username: "teacher_2" } });
  });

  it("should return ONLY active tickets belonging to the requesting Teacher", async () => {
    const response = await TestRequest.get("/api/tickets", authToken);
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data.length).toBe(2);
    expect(body.paging.total_page).toBe(1);

    const titles = body.data.map((t: { title: string }) => t.title);

    expect(titles).toContain("Broken Projector");
    expect(titles).toContain("Teacher's Room AC Not Cold");
    expect(titles).not.toContain("Internet Disconnected");
    expect(titles).not.toContain("Broken Mouse");
  });

  it("should allow ADMIN to see ALL active tickets from all users", async () => {
    const response = await TestRequest.get("/api/tickets", adminToken);
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data.length).toBe(3);
  });

  it("should search tickets successfully using keyword (matches Title or Description)", async () => {
    const response = await TestRequest.get(
      "/api/tickets?keyword=freon",
      authToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data.length).toBe(1);

    expect(body.data[0].title).toBe("Teacher's Room AC Not Cold");
  });

  it("should filter tickets successfully by priority and status", async () => {
    const response = await TestRequest.get(
      "/api/tickets?priority=HIGH&status=SUBMITTED",
      authToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data.length).toBe(1);

    expect(body.data[0].title).toBe("Broken Projector");
  });

  it("should filter tickets successfully by category", async () => {
    const response = await TestRequest.get(
      `/api/tickets?category=${TicketCategory.HARDWARE}`,
      authToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data.length).toBe(1);
    expect(body.data[0].title).toBe("Broken Projector");
    expect(body.data[0].category).toBe(TicketCategory.HARDWARE);
  });

  it("should paginate results correctly", async () => {
    const response = await TestRequest.get(
      "/api/tickets?page=1&size=1",
      authToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data.length).toBe(1);
    expect(body.paging.current_page).toBe(1);
    expect(body.paging.size).toBe(1);
    expect(body.paging.total_page).toBe(2);
  });

  it("should allow ADMIN to filter tickets by specific submitterId", async () => {
    const response = await TestRequest.get(
      `/api/tickets?submitterId=${user2Id}`,
      adminToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data.length).toBe(1);

    expect(body.data[0].title).toBe("Internet Disconnected");
  });
});

describe("GET /api/tickets/:id", () => {
  let authToken = "";
  let adminToken = "";
  let userId = 0;
  let user2Id = 0;

  beforeEach(async () => {
    await UserTest.create();
    await UserTest.createAdmin();

    const user2 = await prismaClient.user.create({
      data: {
        email: "teacher2@gmail.com",
        username: "teacher_2",
        password: await Bun.password.hash("@Adm1n5123", {
          algorithm: "bcrypt",
        }),
        fullName: "Teacher 2",
        role: UserRole.TEACHER,
      },
    });
    user2Id = user2.id;

    const loginResponse = await TestRequest.post("/api/auth/login", {
      identifier: "test_teacher@gmail.com",
      password: "@Adm1n5123",
    });
    authToken =
      loginResponse.headers.get("set-cookie")?.split(";")[0]?.split("=")[1] ||
      "";

    const adminLoginResponse = await TestRequest.post("/api/auth/login", {
      identifier: "test_admin@gmail.com",
      password: "@Adm1n5123",
    });
    adminToken =
      adminLoginResponse.headers
        .get("set-cookie")
        ?.split(";")[0]
        ?.split("=")[1] || "";

    const user = await prismaClient.user.findUnique({
      where: { username: "test_teacher" },
    });
    if (user) userId = user.id;

    await prismaClient.ticket.createMany({
      data: [
        {
          id: "TKT-111111-1001",
          title: "My Own Ticket",
          description: "This belongs to Teacher 1",
          priority: Priority.HIGH,
          status: Status.SUBMITTED,
          submitterId: userId,
        },
        {
          id: "TKT-111111-1002",
          title: "Someone Else's Ticket",
          description: "This belongs to Teacher 2",
          priority: Priority.MEDIUM,
          status: Status.SUBMITTED,
          submitterId: user2Id,
        },
        {
          id: "TKT-111111-1003",
          title: "Deleted Ticket",
          description: "This ticket is in the trash",
          priority: Priority.LOW,
          status: Status.SUBMITTED,
          submitterId: userId,
          deleted_at: new Date(),
        },
      ],
    });
  });

  afterEach(async () => {
    await prismaClient.ticket.deleteMany({
      where: {
        submitter: {
          username: { in: ["test_teacher", "teacher_2", "test_admin"] },
        },
      },
    });
    await UserTest.delete();
    await prismaClient.user.deleteMany({ where: { username: "teacher_2" } });
  });

  it("should return ticket details if requested by the creator (Teacher)", async () => {
    const ticketId = "TKT-111111-1001";

    const response = await TestRequest.get(
      `/api/tickets/${ticketId}`,
      authToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data.id).toBe(ticketId);
    expect(body.data.title).toBe("My Own Ticket");
    expect(body.data.submitter.id).toBe(userId);
  });

  it("should allow ADMIN to get ticket details of any user", async () => {
    const ticketId = "TKT-111111-1002";

    const response = await TestRequest.get(
      `/api/tickets/${ticketId}`,
      adminToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data.id).toBe(ticketId);
    expect(body.data.title).toBe("Someone Else's Ticket");
  });

  it("should REJECT Teacher from accessing another user's ticket", async () => {
    const otherTicketId = "TKT-111111-1002";

    const response = await TestRequest.get(
      `/api/tickets/${otherTicketId}`,
      authToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(403);
    expect(body.errors).toBe(
      "You do not have permission to access this ticket",
    );
  });

  it("should return 404 if ticket does not exist in the database", async () => {
    const fakeTicketId = "TKT-999999-9999";

    const response = await TestRequest.get(
      `/api/tickets/${fakeTicketId}`,
      authToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(404);
    expect(body.errors).toBe("Ticket not found");
  });

  it("should return 404 if ticket is soft-deleted", async () => {
    const deletedTicketId = "TKT-111111-1003";

    const response = await TestRequest.get(
      `/api/tickets/${deletedTicketId}`,
      authToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(404);
    expect(body.errors).toBe("Ticket not found");
  });

  it("should return 400 if ticket ID format is invalid", async () => {
    const invalidId = "TICKET-INVALID-ID";

    const response = await TestRequest.get(
      `/api/tickets/${invalidId}`,
      authToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(400);
    expect(body.errors).toBeDefined();
  });
});

describe("GET /api/tickets/stats", () => {
  let authToken = "";
  let adminToken = "";
  let userId = 0;
  let user2Id = 0;

  beforeEach(async () => {
    await UserTest.create();
    await UserTest.createAdmin();

    const user2 = await prismaClient.user.create({
      data: {
        email: "teacher2@gmail.com",
        username: "teacher_2",
        password: await Bun.password.hash("@Adm1n5123", {
          algorithm: "bcrypt",
        }),
        fullName: "Teacher 2",
        role: UserRole.TEACHER,
      },
    });
    user2Id = user2.id;

    const loginResponse = await TestRequest.post("/api/auth/login", {
      identifier: "test_teacher@gmail.com",
      password: "@Adm1n5123",
    });
    authToken =
      loginResponse.headers.get("set-cookie")?.split(";")[0]?.split("=")[1] ||
      "";

    const adminLoginResponse = await TestRequest.post("/api/auth/login", {
      identifier: "test_admin@gmail.com",
      password: "@Adm1n5123",
    });
    adminToken =
      adminLoginResponse.headers
        .get("set-cookie")
        ?.split(";")[0]
        ?.split("=")[1] || "";

    const user = await prismaClient.user.findUnique({
      where: { username: "test_teacher" },
    });
    if (user) userId = user.id;

    await prismaClient.ticket.createMany({
      data: [
        {
          id: "TKT-777777-1001",
          title: "T1",
          description: "D1",
          priority: Priority.HIGH,
          status: Status.SUBMITTED,
          category: TicketCategory.HARDWARE,
          submitterId: userId,
        },
        {
          id: "TKT-777777-1002",
          title: "T2",
          description: "D2",
          priority: Priority.LOW,
          status: Status.ONGOING,
          category: TicketCategory.NETWORK,
          submitterId: userId,
        },
        {
          id: "TKT-777777-1003",
          title: "T3",
          description: "D3",
          priority: Priority.MEDIUM,
          status: Status.REJECTED,
          category: TicketCategory.SOFTWARE,
          submitterId: userId,
        },
        {
          id: "TKT-777777-1004",
          title: "T4",
          description: "Trash",
          priority: Priority.HIGH,
          status: Status.SUBMITTED,
          category: TicketCategory.OTHERS,
          submitterId: userId,
          deleted_at: new Date(),
        },
        {
          id: "TKT-777777-2001",
          title: "T5",
          description: "D5",
          priority: Priority.LOW,
          status: Status.DONE,
          category: TicketCategory.FACILITIES,
          submitterId: user2Id,
        },
        {
          id: "TKT-777777-2002",
          title: "T6",
          description: "D6",
          priority: Priority.HIGH,
          status: Status.SUBMITTED,
          category: TicketCategory.HARDWARE,
          submitterId: user2Id,
        },
      ],
    });
  });

  afterEach(async () => {
    await prismaClient.ticket.deleteMany({
      where: {
        submitter: {
          username: { in: ["test_teacher", "teacher_2", "test_admin"] },
        },
      },
    });
    await UserTest.delete();
    await prismaClient.user.deleteMany({ where: { username: "teacher_2" } });
  });

  it("should return correct statistics for a Teacher (only counting their own active tickets)", async () => {
    const response = await TestRequest.get("/api/tickets/stats", authToken);
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);

    expect(body.data.total).toBe(3);

    expect(body.data.byStatus.SUBMITTED).toBe(1);
    expect(body.data.byStatus.ONGOING).toBe(1);
    expect(body.data.byStatus.REJECTED).toBe(1);
    expect(body.data.byStatus.DONE).toBe(0);

    expect(body.data.byPriority.HIGH).toBe(1);
    expect(body.data.byPriority.MEDIUM).toBe(1);
    expect(body.data.byPriority.LOW).toBe(1);

    expect(body.data.byCategory.HARDWARE).toBe(1);
    expect(body.data.byCategory.NETWORK).toBe(1);
    expect(body.data.byCategory.SOFTWARE).toBe(1);
    expect(body.data.byCategory.ELECTRICAL).toBe(0);
    expect(body.data.byCategory.FACILITIES).toBe(0);
    expect(body.data.byCategory.OTHERS).toBe(0);
  });

  it("should return correct statistics for an Admin (counting all users' active tickets)", async () => {
    const response = await TestRequest.get("/api/tickets/stats", adminToken);
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);

    expect(body.data.total).toBe(5);

    expect(body.data.byStatus.SUBMITTED).toBe(2);
    expect(body.data.byStatus.ONGOING).toBe(1);
    expect(body.data.byStatus.REJECTED).toBe(1);
    expect(body.data.byStatus.DONE).toBe(1);

    expect(body.data.byPriority.HIGH).toBe(2);
    expect(body.data.byPriority.MEDIUM).toBe(1);
    expect(body.data.byPriority.LOW).toBe(2);

    expect(body.data.byCategory.HARDWARE).toBe(2);
    expect(body.data.byCategory.NETWORK).toBe(1);
    expect(body.data.byCategory.SOFTWARE).toBe(1);
    expect(body.data.byCategory.ELECTRICAL).toBe(0);
    expect(body.data.byCategory.FACILITIES).toBe(1);
    expect(body.data.byCategory.OTHERS).toBe(0);
  });
});
