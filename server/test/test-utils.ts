import { sign } from "hono/jwt";
import { UserRole } from "../src/generated/prisma/enums";
import bcrypt from "bcrypt";
import { prismaClient } from "../src/lib/prisma";
import { web } from "../src/application/web";
import type { User } from "../src/generated/prisma/client";

export class UserTest {
  static async delete() {
    await prismaClient.user.deleteMany({
      where: {
        username: {
          contains: "test_",
        },
      },
    });
  }

  static async create(): Promise<void> {
    const password = await bcrypt.hash("@Adm1n5123", 10);
    await prismaClient.user.create({
      data: {
        email: "test_teacher@gmail.com",
        username: "test_teacher",
        password: password,
        fullName: "test",
      },
    });
  }

  static async createAdmin(): Promise<void> {
    const password = await bcrypt.hash("@Adm1n5123", 10);
    await prismaClient.user.create({
      data: {
        email: "test_admin@gmail.com",
        username: "test_admin",
        password: password,
        fullName: "test",
        role: UserRole.ADMIN,
      },
    });
  }

  static async getTeacher(): Promise<User> {
    const user = await prismaClient.user.findFirst({
      where: {
        username: "test_teacher",
      },
    });

    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  static async getAdmin(): Promise<User> {
    const user = await prismaClient.user.findFirst({
      where: {
        username: "test_admin",
      },
    });

    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  static async findByEmail(email: string): Promise<User | null> {
    return await prismaClient.user.findUnique({
      where: {
        email: email,
      },
    });
  }
}

export class TestRequest {
  private static makeHeaders(
    token?: string,
    customHeaders: Record<string, string> = {},
  ): Headers {
    const headers = new Headers(customHeaders);

    if (!headers.has("Content-Type")) {
      headers.append("Content-Type", "application/json");
    }

    if (token) {
      headers.append("Cookie", `auth_token=${token}`);
    }
    return headers;
  }

  //   private static createMockEnv() {
  //     return {
  //       server: {
  //         requestIP: () => {
  //           const randomIP = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  //           return { address: randomIP, family: "IPv4" };
  //         },
  //       },
  //     };
  //   }

  static async post<T>(
    url: string,
    body: T,
    token?: string,
    customHeaders?: Record<string, string>,
  ): Promise<Response> {
    return web.request(
      url,
      {
        method: "POST",
        headers: this.makeHeaders(token, customHeaders),
        body: JSON.stringify(body),
      },
      //   this.createMockEnv(),
    );
  }

  static async postMultipart(
    url: string,
    formData: FormData,
    token?: string,
  ): Promise<Response> {
    const headers = new Headers();
    if (token) {
      headers.append("Cookie", `auth_token=${token}`);
      headers.append("Origin", "http://localhost:5173");
    }

    return web.request(
      url,
      {
        method: "POST",
        headers: headers,
        body: formData,
      },
      //   this.createMockEnv(),
    );
  }

  static async get(url: string, token?: string): Promise<Response> {
    return web.request(
      url,
      {
        method: "GET",
        headers: this.makeHeaders(token),
      },
      //   this.createMockEnv(),
    );
  }

  static async patch<T>(
    url: string,
    body: T,
    token?: string,
  ): Promise<Response> {
    return web.request(
      url,
      {
        method: "PATCH",
        headers: this.makeHeaders(token),
        body: JSON.stringify(body),
      },
      //   this.createMockEnv(),
    );
  }

  static async delete(url: string, token?: string): Promise<Response> {
    return web.request(
      url,
      {
        method: "DELETE",
        headers: this.makeHeaders(token),
      },
      //   this.createMockEnv(),
    );
  }

  static async patchMultipart(
    url: string,
    formData: FormData,
    token?: string,
  ): Promise<Response> {
    const headers = new Headers();
    if (token) {
      headers.append("Cookie", `auth_token=${token}`);
      headers.append("Origin", "http://localhost:5173");
    }

    return web.request(
      url,
      {
        method: "PATCH",
        headers: headers,
        body: formData,
      },
      //   this.createMockEnv(),
    );
  }
}
