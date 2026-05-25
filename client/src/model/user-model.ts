import type { UserRole } from "@/enum/user";

export type UserResponse = {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
};

export type LoginUserRequest = {
  identifier: string;
  password: string;
};

export type RegisterUserRequest = {
  email: string;
  username: string;
  password: string;
  fullName: string;
  secondary_number?: string; //Honeypot
};

export type User = {
  id: number;
  fullName: string;
  username: string;
};

export function toUserResponse(data: UserResponse): UserResponse {
  return {
    id: data.id,
    username: data.username,
    fullName: data.fullName,
    email: data.email,
    role: data.role,
  };
}
