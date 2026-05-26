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
    // Validate the incoming registration payload against the defined Zod schema
    const registerRequest = Validation.validate(
      UserValidation.REGISTER,
      request,
    );

    // Honeypot Trap: Catch automated bots
    // If the hidden 'secondary_number' field is filled, it's a bot.
    // We return a fake success response to deceive the bot without touching the database.
    if (registerRequest.secondary_number) {
      console.warn(
        `[BOT BLOCKED] Fake registration attempt prevented from: ${registerRequest.email}`,
      );
      return {
        id: Math.floor(Math.random() * 10000) + 90000,
        email: registerRequest.email,
        username: registerRequest.username,
        fullName: registerRequest.fullName,
        role: UserRole.TEACHER,
      } as UserResponse;
    }

    // Check for username duplication to ensure uniqueness
    const totalUserWithSameUsername = await prismaClient.user.count({
      where: {
        username: registerRequest.username,
      },
    });

    // Check for email duplication to ensure uniqueness
    const totalUserWithSameEmail = await prismaClient.user.count({
      where: {
        email: registerRequest.email,
      },
    });

    // Throw specific errors if the user already exists
    if (totalUserWithSameUsername !== 0) {
      throw new ResponseError(400, "Username already registered");
    }

    if (totalUserWithSameEmail !== 0) {
      throw new ResponseError(400, "Email already registered");
    }

    // Hash the password securely with a salt round of 10 before saving to the database
    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

    // Destructure the payload to exclude the honeypot field before insertion
    const { secondary_number, ...userData } = registerRequest;

    // Persist the new user to the database
    const user = await prismaClient.user.create({
      data: userData,
    });

    // Return the sanitized user data
    return toUserResponse(user);
  }

  static async login(request: LoginUserRequest): Promise<UserResponse> {
    // Validate the login credentials against the schema
    const loginRequest = Validation.validate(UserValidation.LOGIN, request);

    // Attempt to find the user using either their email OR username
    const user = await prismaClient.user.findFirst({
      where: {
        OR: [
          { email: loginRequest.identifier },
          { username: loginRequest.identifier },
        ],
      },
    });

    // Throw an error if the user is not found or has no password set
    if (!user || !user.password) {
      throw new ResponseError(401, "Username/email or password is wrong");
    }

    // Verify if the provided password matches the hashed password in the database
    const isPasswordCorrect = await bcrypt.compare(
      loginRequest.password,
      user.password,
    );

    if (!isPasswordCorrect) {
      throw new ResponseError(401, "Username/email or password is wrong");
    }

    // Construct the JWT payload with essential user information
    // Set token expiration time (exp) to 24 hours from now
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    };

    // Sign the payload to generate the JSON Web Token
    const jwtToken = await sign(payload, process.env.JWT_SECRET!);

    // Return user details along with the generated token
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
    // Format the database user object into a safe API response
    return toUserResponse(user);
  }

  static async logout(): Promise<void> {
    // Just Logout and delete token (at controller)

    return;
  }
}
