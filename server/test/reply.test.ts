import { describe, afterEach, beforeEach, it, expect } from "bun:test";
import { TestRequest, UserTest } from "./test-utils";
import { prismaClient } from "../src/lib/prisma";
import { Priority, Status, UserRole } from "../src/generated/prisma/enums";
import { logger } from "../src/application/logging";

describe("POST /api/tickets/:id/replies", () => {
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
          id: "TKT-555555-1001",
          title: "Active Ticket T1",
          description: "Ongoing issue",
          priority: Priority.HIGH,
          status: Status.ONGOING,
          submitterId: userId,
        },
        {
          id: "TKT-555555-1002",
          title: "Active Ticket T2",
          description: "Submitted issue",
          priority: Priority.MEDIUM,
          status: Status.SUBMITTED,
          submitterId: user2Id,
        },
        {
          id: "TKT-555555-1003",
          title: "Resolved Ticket",
          description: "Already fixed",
          priority: Priority.LOW,
          status: Status.DONE,
          submitterId: userId,
        },
        {
          id: "TKT-555555-1004",
          title: "Deleted Ticket",
          description: "In the trash",
          priority: Priority.LOW,
          status: Status.SUBMITTED,
          submitterId: userId,
          deleted_at: new Date(),
        },
      ],
    });
  });

  afterEach(async () => {
    await prismaClient.ticketReply.deleteMany({
      where: {
        ticket: {
          submitter: {
            username: { in: ["test_teacher", "teacher_2", "test_admin"] },
          },
        },
      },
    });

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

  it("should allow Teacher to successfully reply to their own active ticket", async () => {
    const ticketId = "TKT-555555-1001";
    const payload = { message: "Thank you, I will wait for the update." };

    const response = await TestRequest.post(
      `/api/tickets/${ticketId}/replies`,
      payload,
      authToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data.message).toBe(payload.message);
    expect(body.data.ticketId).toBe(ticketId);
    expect(body.data.senderId).toBe(userId);
    expect(body.data.sender.fullName).toBeDefined();
  });

  it("should allow Admin to successfully reply to any active ticket", async () => {
    const ticketId = "TKT-555555-1002";
    const payload = { message: "We are currently checking the issue." };

    const response = await TestRequest.post(
      `/api/tickets/${ticketId}/replies`,
      payload,
      adminToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data.message).toBe(payload.message);
    expect(body.data.ticketId).toBe(ticketId);
  });

  it("should REJECT Teacher from replying to someone else's ticket", async () => {
    const ticketId = "TKT-555555-1002";
    const payload = { message: "Can I also get help?" };

    const response = await TestRequest.post(
      `/api/tickets/${ticketId}/replies`,
      payload,
      authToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(403);
    expect(body.errors).toBe(
      "You do not have permission to reply to this ticket.",
    );
  });

  it("should REJECT reply if the ticket is already DONE or REJECTED", async () => {
    const ticketId = "TKT-555555-1003";
    const payload = { message: "Wait, the projector is broken again." };

    const response = await TestRequest.post(
      `/api/tickets/${ticketId}/replies`,
      payload,
      authToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(400);
    expect(body.errors).toBe("Cannot reply to a resolved or rejected ticket.");
  });

  it("should return 404 if trying to reply to a deleted ticket", async () => {
    const ticketId = "TKT-555555-1004";
    const payload = { message: "Is this still active?" };

    const response = await TestRequest.post(
      `/api/tickets/${ticketId}/replies`,
      payload,
      authToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(404);
    expect(body.errors).toBe("Ticket not found or has been deleted.");
  });

  it("should return 400 Validation Error if the message is empty", async () => {
    const ticketId = "TKT-555555-1001";
    const payload = { message: "" };

    const response = await TestRequest.post(
      `/api/tickets/${ticketId}/replies`,
      payload,
      authToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(400);
    expect(body.errors).toBeDefined();
  });
});

describe("GET /api/tickets/:id/replies", () => {
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

    const adminUser = await prismaClient.user.findUnique({
      where: { username: "test_admin" },
    });

    await prismaClient.ticket.createMany({
      data: [
        {
          id: "TKT-666666-1001",
          title: "Ticket 1",
          description: "Issue 1",
          priority: Priority.HIGH,
          status: Status.ONGOING,
          submitterId: userId,
        },
        {
          id: "TKT-666666-1002",
          title: "Ticket 2",
          description: "Issue 2",
          priority: Priority.MEDIUM,
          status: Status.SUBMITTED,
          submitterId: user2Id,
        },
        {
          id: "TKT-666666-1003",
          title: "Deleted Ticket",
          description: "Trash",
          priority: Priority.LOW,
          status: Status.SUBMITTED,
          submitterId: userId,
          deleted_at: new Date(),
        },
      ],
    });

    if (adminUser) {
      await prismaClient.ticketReply.createMany({
        data: [
          {
            message: "First message from teacher",
            ticketId: "TKT-666666-1001",
            senderId: userId,
          },
          {
            message: "Reply from admin",
            ticketId: "TKT-666666-1001",
            senderId: adminUser.id,
          },
        ],
      });
    }
  });

  afterEach(async () => {
    await prismaClient.ticketReply.deleteMany({
      where: {
        ticket: {
          submitter: {
            username: { in: ["test_teacher", "teacher_2", "test_admin"] },
          },
        },
      },
    });

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

  it("should return all replies for an active ticket when requested by the creator", async () => {
    const ticketId = "TKT-666666-1001";

    const response = await TestRequest.get(
      `/api/tickets/${ticketId}/replies`,
      authToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(2);
    expect(body.data[0].message).toBe("First message from teacher");
    expect(body.data[1].message).toBe("Reply from admin");
  });

  it("should allow Admin to view replies of any active ticket", async () => {
    const ticketId = "TKT-666666-1001";

    const response = await TestRequest.get(
      `/api/tickets/${ticketId}/replies`,
      adminToken,
    );

    expect(response.status).toBe(200);
  });

  it("should REJECT Teacher from viewing replies of someone else's ticket", async () => {
    const ticketId = "TKT-666666-1002";

    const response = await TestRequest.get(
      `/api/tickets/${ticketId}/replies`,
      authToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(403);
    expect(body.errors).toBe(
      "You do not have permission to view replies for this ticket.",
    );
  });

  it("should return 404 if trying to get replies from a deleted ticket", async () => {
    const ticketId = "TKT-666666-1003";

    const response = await TestRequest.get(
      `/api/tickets/${ticketId}/replies`,
      authToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(404);
    expect(body.errors).toBe("Ticket not found or has been deleted.");
  });
});
