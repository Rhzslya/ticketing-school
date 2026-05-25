import { describe, afterEach, beforeEach, it, expect } from "bun:test";

import { AiService } from "../service/ai-service";
import { Priority, TicketCategory } from "../src/generated/prisma/enums";
import { TestRequest, UserTest } from "./test-utils";
import { logger } from "../src/application/logging";

describe("POST /api/tickets/analyze", () => {
  let authToken = "";

  const originalAnalyzeTicket = AiService.analyzeTicket;

  beforeEach(async () => {
    await UserTest.create();
    const loginResponse = await TestRequest.post("/api/auth/login", {
      identifier: "test_teacher@gmail.com",
      password: "@Adm1n5123",
    });
    authToken =
      loginResponse.headers.get("set-cookie")?.split(";")[0]?.split("=")[1] ||
      "";
  });

  afterEach(async () => {
    await UserTest.delete();
    AiService.analyzeTicket = originalAnalyzeTicket;
  });

  it("should return AI analysis successfully (MOCKED)", async () => {
    AiService.analyzeTicket = async () => {
      return { priority: Priority.HIGH, category: TicketCategory.NETWORK };
    };

    const payload = {
      description: "Kabel LAN internet di ruang guru putus digigit tikus.",
    };

    const response = await TestRequest.post(
      "/api/tickets/analyze",
      payload,
      authToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data.priority).toBe(Priority.HIGH);
    expect(body.data.category).toBe(TicketCategory.NETWORK);
  });

  it("should return default LOW/OTHERS if description is empty without hitting AI", async () => {
    let isAiCalled = false;
    AiService.analyzeTicket = async () => {
      isAiCalled = true;
      return { priority: Priority.HIGH, category: TicketCategory.NETWORK };
    };

    const payload = { description: "   " };

    const response = await TestRequest.post(
      "/api/tickets/analyze",
      payload,
      authToken,
    );
    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data.priority).toBe(Priority.LOW);
    expect(body.data.category).toBe(TicketCategory.OTHERS);

    expect(isAiCalled).toBe(false);
  });
});
