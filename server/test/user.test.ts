import { describe, afterEach, beforeEach, it, expect } from "bun:test";
import { TestRequest, UserTest } from "./test-utils";
import type {
  LoginUserRequest,
  RegisterUserRequest,
} from "../model/user-model";
import { logger } from "../src/application/logging";
import { prismaClient } from "../src/lib/prisma";

describe("POST /api/users", () => {
  beforeEach(async () => {
    await UserTest.delete();
  });

  afterEach(async () => {
    await UserTest.delete();
  });

  it("should register user", async () => {
    const requestBody: RegisterUserRequest = {
      email: "test_teacher@gmail.com",
      username: "test_teacher",
      password: "@Adm1n5123",
      fullName: "test",
    };

    const response = await TestRequest.post<RegisterUserRequest>(
      "/api/users",
      requestBody,
    );

    const body = await response.json();

    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data.email).toBe("test_teacher@gmail.com");
    expect(body.data.username).toBe("test_teacher");
    expect(body.data.fullName).toBe("test");
  }, 15000);

  it("it should reject register new user if request is invalid", async () => {
    const requestBody: RegisterUserRequest = {
      email: "",
      username: "",
      password: "",
      fullName: "",
    };

    const response = await TestRequest.post<RegisterUserRequest>(
      "/api/users",
      requestBody,
    );

    const body = await response.json();

    logger.debug(body);

    expect(response.status).toBe(400);
    expect(body.errors).toBeDefined();
  });

  it("should reject register new user if username already exists", async () => {
    await UserTest.create();

    const requestBody: RegisterUserRequest = {
      email: "test@gmail.com",
      username: "test_teacher",
      password: "@Adm1n5123",
      fullName: "test",
    };

    const response = await TestRequest.post<RegisterUserRequest>(
      "/api/users",
      requestBody,
    );

    const body = await response.json();

    logger.debug(body);

    expect(response.status).toBe(400);
    expect(body.errors).toBeDefined();
  }, 15000);

  it("should reject register new user if email already exists", async () => {
    await UserTest.create();

    const requestBody: RegisterUserRequest = {
      email: "test_teacher@gmail.com",
      username: "test12",
      password: "@Adm1n5123",
      fullName: "test",
    };

    const response = await TestRequest.post<RegisterUserRequest>(
      "/api/users",
      requestBody,
    );

    const body = await response.json();

    logger.debug(body);

    expect(response.status).toBe(400);
    expect(body.errors).toBeDefined();
  }, 15000);

  it("should reject register if email format is invalid", async () => {
    const requestBody: RegisterUserRequest = {
      email: "invalid-email-format",
      username: "test",
      password: "password123",
      fullName: "test",
    };

    const response = await TestRequest.post<RegisterUserRequest>(
      "/api/users",
      requestBody,
    );

    const body = await response.json();

    logger.debug(body);

    expect(response.status).toBe(400);
    expect(body.errors).toBeDefined();
  });

  it("should reject register if password is too short", async () => {
    const requestBody: RegisterUserRequest = {
      email: "test2@gmail.com",
      username: "test2",
      password: "123",
      fullName: "test2",
    };

    const response = await TestRequest.post<RegisterUserRequest>(
      "/api/users",
      requestBody,
    );

    const body = await response.json();
    console.log(body);

    expect(response.status).toBe(400);
    expect(body.errors).toBeDefined();
  });

  it("should silently fail (return 200 but NOT save to DB) if honeypot field is filled by bot", async () => {
    const requestBody: RegisterUserRequest = {
      email: "bot_spammer@gmail.com",
      username: "bot_spammer",
      password: "@Adm1n5123",
      fullName: "Bot User",
      secondary_number: "08123456789",
    };

    const response = await TestRequest.post<RegisterUserRequest>(
      "/api/users",
      requestBody,
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);

    expect(body.data.email).toBe("bot_spammer@gmail.com");
    expect(body.data.username).toBe("bot_spammer");
    expect(body.data.fullName).toBe("Bot User");
    expect(body.data.id).toBeDefined();

    const userInDb = await prismaClient.user.findUnique({
      where: {
        email: "bot_spammer@gmail.com",
      },
    });

    expect(userInDb).toBeNull();
  }, 15000);
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await UserTest.create();
  });

  afterEach(async () => {
    await UserTest.delete();
  });

  it("should successfully login using email and receive auth_token cookie", async () => {
    const requestBody: LoginUserRequest = {
      identifier: "test_teacher@gmail.com",
      password: "@Adm1n5123",
    };

    const response = await TestRequest.post<LoginUserRequest>(
      "/api/auth/login",
      requestBody,
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data.email).toBe("test_teacher@gmail.com");

    const setCookieHeader = response.headers.get("set-cookie");
    expect(setCookieHeader).toBeDefined();
    expect(setCookieHeader).toContain("auth_token=");
    expect(setCookieHeader).toContain("HttpOnly");
  });

  it("should reject login if email or username is wrong", async () => {
    const requestBody: LoginUserRequest = {
      identifier: "salah@gmail.com",
      password: "@Adm1n5123",
    };

    const response = await TestRequest.post<LoginUserRequest>(
      "/api/auth/login",
      requestBody,
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(401);
    expect(body.errors).toBeDefined();
  });

  it("should reject login if password is wrong", async () => {
    const requestBody: LoginUserRequest = {
      identifier: "test_customer@gmail.com",
      password: "password_salah123",
    };

    const response = await TestRequest.post<LoginUserRequest>(
      "/api/auth/login",
      requestBody,
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(401);
    expect(body.errors).toBeDefined();
  });

  it("should reject login if request is invalid (Zod Validation)", async () => {
    const requestBody = {
      identifier: "",
      password: "",
    } as LoginUserRequest;

    const response = await TestRequest.post<LoginUserRequest>(
      "/api/auth/login",
      requestBody,
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(400);
    expect(body.errors).toBeDefined();
  });
});

describe("GET /api/users/current", () => {
  beforeEach(async () => {
    await UserTest.create();
  });

  afterEach(async () => {
    await UserTest.delete();
  });

  it("should get current user", async () => {
    const loginResponse = await TestRequest.post("/api/auth/login", {
      identifier: "test_teacher@gmail.com",
      password: "@Adm1n5123",
    });

    const loginCookieHeader = loginResponse.headers.get("set-cookie");
    const authToken = loginCookieHeader?.split(";")[0]?.split("=")[1] || "";

    const response = await TestRequest.get("/api/users/current", authToken);
    const body = await response.json();

    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data.email).toBe("test_teacher@gmail.com");
    expect(body.data.username).toBe("test_teacher");
    expect(body.data.fullName).toBe("test");
  });

  it("should reject if user is not logged in", async () => {
    const response = await TestRequest.get("/api/users/current");
    expect(response.status).toBe(401);
  });
});

describe("DELETE /api/auth/logout", () => {
  beforeEach(async () => {
    await UserTest.create();
  });

  afterEach(async () => {
    await UserTest.delete();
  });

  it("should successfully logout and clear the auth_token cookie", async () => {
    const loginResponse = await TestRequest.post<LoginUserRequest>(
      "/api/auth/login",
      {
        identifier: "test_teacher@gmail.com",
        password: "@Adm1n5123",
      },
    );

    const loginCookieHeader = loginResponse.headers.get("set-cookie");
    const authToken = loginCookieHeader?.split(";")[0]?.split("=")[1] || "";

    const response = await TestRequest.delete("/api/auth/logout", authToken);

    const body = await response.json();
    logger.debug(body);
    expect(response.status).toBe(200);

    const logoutCookieHeader = response.headers.get("set-cookie");

    expect(logoutCookieHeader).toBeDefined();
    expect(logoutCookieHeader).toContain("auth_token=");
    expect(logoutCookieHeader).toContain("Max-Age=0");
  });

  it("should reject logout if user is not authenticated (no token)", async () => {
    const response = await TestRequest.delete("/api/auth/logout");

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(401);
    expect(body.errors).toBeDefined();
  });
});
