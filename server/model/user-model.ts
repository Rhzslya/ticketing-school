import type { User } from "../src/generated/prisma/client";
import type { UserRole } from "../src/generated/prisma/enums";

export type UserResponse = {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  token?: string | null;
};

export type RegisterUserRequest = {
  email: string;
  username: string;
  fullName: string;
  password: string;
  secondary_number?: string; //Honeypot
};

export type LoginUserRequest = {
  identifier: string;
  password: string;
};

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  };
}
