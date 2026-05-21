import { ResponseError } from "../error/response-error";
import {
  toUserResponse,
  type RegisterUserRequest,
  type LoginUserRequest,
  type UserResponse,
} from "../model/user-model";
import { UserRole } from "../src/generated/prisma/enums";
import { prismaClient } from "../src/lib/prisma";
import { UserValidation } from "../validation/user-validation";
import { Validation } from "../validation/validation";
import bcrypt from "bcrypt";
import { sign } from "hono/jwt";
import type { User } from "../src/generated/prisma/client";

export class UserService {
  static async register(request: RegisterUserRequest): Promise<UserResponse> {
    const registerRequest = Validation.validate(
      UserValidation.REGISTER,
      request,
    );

    if (registerRequest.secondary_number) {
      console.warn(
        `[BOT BLOCKED] Fake registration from: ${registerRequest.email}`,
      );
      return {
        id: Math.floor(Math.random() * 10000) + 90000,
        email: registerRequest.email,
        username: registerRequest.username,
        fullName: registerRequest.fullName,
        role: UserRole.TEACHER,
      } as UserResponse;
    }

    const totalUserWithSameUsername = await prismaClient.user.count({
      where: {
        username: registerRequest.username,
      },
    });

    const totalUserWithSameEmail = await prismaClient.user.count({
      where: {
        email: registerRequest.email,
      },
    });

    if (totalUserWithSameUsername != 0) {
      throw new ResponseError(400, "Username already registered");
    }

    if (totalUserWithSameEmail != 0) {
      throw new ResponseError(400, "Email already registered");
    }

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

    const { secondary_number, ...userData } = registerRequest;

    const user = await prismaClient.user.create({
      data: userData,
    });

    return toUserResponse(user);
  }
  static async login(request: LoginUserRequest): Promise<UserResponse> {
    const loginRequest = Validation.validate(UserValidation.LOGIN, request);

    const user = await prismaClient.user.findFirst({
      where: {
        OR: [
          { email: loginRequest.identifier },
          { username: loginRequest.identifier },
        ],
      },
    });

    if (!user || !user.password) {
      throw new ResponseError(401, "Username/email or password is wrong");
    }

    const isPasswordCorrect = await bcrypt.compare(
      loginRequest.password,
      user.password,
    );

    if (!isPasswordCorrect) {
      throw new ResponseError(401, "Username/email or password is wrong");
    }

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    };

    const jwtToken = await sign(payload, process.env.JWT_SECRET!);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      token: jwtToken,
    };
  }

  static async get(user: User): Promise<UserResponse> {
    return toUserResponse(user);
  }

  static async logout(): Promise<void> {
    return;
  }
}
