import type { Context } from "hono";
import type {
  LoginUserRequest,
  RegisterUserRequest,
} from "../model/user-model";
import { UserService } from "../service/user-service";
import { deleteCookie, setCookie } from "hono/cookie";
import { ResponseError } from "../error/response-error";
import type { ApplicationVariables } from "../type/hono-context";

export class UserController {
  static async register(c: Context) {
    try {
      const request = (await c.req.json()) as RegisterUserRequest;

      const response = await UserService.register(request);

      return c.json({ data: response });
    } catch (error) {
      throw error;
    }
  }

  static async login(c: Context) {
    try {
      const request = (await c.req.json()) as LoginUserRequest;

      const response = await UserService.login(request);

      if (!response.token) {
        throw new ResponseError(500, "Failed to generate authentication token");
      }

      setCookie(c, "auth_token", response.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 60 * 60 * 24,
        path: "/",
      });

      const { token, ...safeResponse } = response;

      return c.json({
        message: "Login Success",
        data: safeResponse,
      });
    } catch (error) {
      throw error;
    }
  }

  static async get(c: Context<{ Variables: ApplicationVariables }>) {
    try {
      const user = c.var.user;

      const response = await UserService.get(user);

      return c.json({ data: response });
    } catch (error) {
      throw error;
    }
  }

  static async logout(c: Context) {
    try {
      await UserService.logout(); //Just Dummy for Consistency Patterns

      deleteCookie(c, "auth_token", { path: "/" });

      return c.json({ message: "OK" });
    } catch (error) {
      throw error;
    }
  }
}
