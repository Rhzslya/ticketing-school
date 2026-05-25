import { api } from "@/lib/axios";
import type { ApiResponse } from "@/model/api-model";
import {
  toUserResponse,
  type LoginUserRequest,
  type RegisterUserRequest,
  type UserResponse,
} from "@/model/user-model";
import { UserValidation } from "@/validation/user-validation";
import { Validation } from "@/validation/validation";
import axios from "axios";

export class UserService {
  static async login(request: LoginUserRequest): Promise<UserResponse> {
    const loginRequest = Validation.validate(UserValidation.LOGIN, request);

    const payload = {
      identifier: loginRequest.identifier,
      password: loginRequest.password,
    };

    const response = await api.post<ApiResponse<UserResponse>>(
      "/auth/login",
      payload,
    );

    return toUserResponse(response.data.data);
  }

  static async register(request: RegisterUserRequest): Promise<UserResponse> {
    const registerRequest = Validation.validate(
      UserValidation.REGISTER,
      request,
    );

    const payload = {
      email: registerRequest.email,
      username: registerRequest.username,
      password: registerRequest.password,
      fullName: registerRequest.fullName,
    };

    const response = await api.post<ApiResponse<UserResponse>>(
      "/users",
      payload,
    );
    return toUserResponse(response.data.data);
  }

  static async get(): Promise<UserResponse> {
    const response = await api.get<ApiResponse<UserResponse>>("/users/current");

    return toUserResponse(response.data.data);
  }

  static async logout(): Promise<boolean> {
    try {
      await api.delete("/auth/logout");

      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          return true;
        }
      }

      return true;
    }
  }
}
