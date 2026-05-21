import { describe, afterEach, beforeEach, it, expect } from "bun:test";
import { TestRequest, UserTest } from "./test-utils";
import { logger } from "../src/application/logging";
import { prismaClient } from "../src/lib/prisma";
import type { CreateTicketRequest } from "../model/ticket-model";
import { Priority, Status, UserRole } from "../src/generated/prisma/enums";

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

  it("should create a new ticket successfully", async () => {
    const requestBody: CreateTicketRequest = {
      title: "Class 1A Projector Dead",
      description: "Red indicator light is flashing, can't display image.",
      priority: Priority.HIGH,
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
    expect(body.data.status).toBe("SUBMITTED");

    expect(body.data.submitter).toBeDefined();
    expect(body.data.submitter.username).toBe("test_teacher");
  });

  it("should create ticket WITH attachment/image (multipart/form-data", async () => {
    const formData = new FormData();
    formData.append("title", "Website Error in My PC");
    formData.append("description", "I cannot open website");
    formData.append("priority", Priority.HIGH);
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
  });

  it("should create ticket WITH multi attachment/image (multipart/form-data", async () => {
    const formData = new FormData();
    formData.append("title", "Multi Image Test");
    formData.append("description", "I have attached 2 photos.");
    formData.append("priority", Priority.MEDIUM);

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
  });

  it("should create a ticket with default LOW priority if not provided", async () => {
    const requestBody = {
      title: "The AC in the Teacher's Room is Not Cold Enoughn",
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
  });

  it("should reject ticket creation if validation fails (empty title)", async () => {
    const requestBody = {
      title: "",
      description: "Description is there but title is empty",
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

  it("should update ticket details successfully (JSON)", async () => {
    const ticket = await prismaClient.ticket.create({
      data: {
        id: "TKT-111111-1001",
        title: "Old Title",
        description: "Old Description",
        priority: Priority.LOW,
        submitterId: userId,
      },
    });

    const requestBody = {
      title: "Updated Title",
      description: "Updated Description",
      priority: Priority.HIGH,
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
  });

  it("should allow update without making any changes (duplicate bypass check)", async () => {
    const ticket = await prismaClient.ticket.create({
      data: {
        id: "TKT-111111-1002",
        title: "Exact Same Title",
        description: "Exact Same Description",
        priority: Priority.MEDIUM,
        submitterId: userId,
      },
    });

    const requestBody = {
      title: "Exact Same Title",
      description: "Exact Same Description",
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

  it("should update ticket WITH new attachments and delete_attachment flag (multipart)", async () => {
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
