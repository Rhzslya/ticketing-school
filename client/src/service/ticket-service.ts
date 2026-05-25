import { api } from "@/lib/axios";
import type { ApiResponse } from "@/model/api-model";
import {
  toTicketResponse,
  type CreateTicketRequest,
  type DeleteTicketRequest,
  type DeleteTicketResponse,
  type GetDetailedTicketRequest,
  type SearchTicketRequest,
  type TicketResponse,
  type TicketStatisticsResponse,
  type UpdateTicketRequest,
} from "@/model/ticket-model";
import { objectToFormData } from "@/utils/form-helper";
import { TicketValidation } from "@/validation/ticket-validation";
import { Validation } from "@/validation/validation";

export class TicketService {
  static async create(request: CreateTicketRequest): Promise<TicketResponse> {
    const createProductRequest = Validation.validate(
      TicketValidation.CREATE,
      request,
    );

    const formData = objectToFormData(createProductRequest);

    const response = await api.post<ApiResponse<TicketResponse>>(
      "/tickets",
      formData,
    );

    return toTicketResponse(response.data.data);
  }

  static async search(
    request: SearchTicketRequest,
  ): Promise<ApiResponse<TicketResponse[]>> {
    const response = await api.get<ApiResponse<TicketResponse[]>>("/tickets", {
      params: request,
    });

    return response.data;
  }

  static async get(request: GetDetailedTicketRequest): Promise<TicketResponse> {
    const response = await api.get<ApiResponse<TicketResponse>>(
      `/tickets/${request.id}`,
    );

    return toTicketResponse(response.data.data);
  }

  static async update(request: UpdateTicketRequest): Promise<TicketResponse> {
    const updateTicketRequest = Validation.validate(
      TicketValidation.UPDATE,
      request,
    );

    const formData = objectToFormData({
      ...updateTicketRequest,
      delete_attachment: updateTicketRequest.delete_attachment
        ? "true"
        : "false",
    });

    const response = await api.patch<ApiResponse<TicketResponse>>(
      `/tickets/${request.id}`,
      formData,
    );

    return toTicketResponse(response.data.data);
  }

  static async remove(
    request: DeleteTicketRequest,
  ): Promise<DeleteTicketResponse> {
    const response = await api.delete<ApiResponse<boolean>>(
      `/tickets/${request.id}/delete`,
    );

    return {
      message: response.data.message || "Ticket deleted successfully",
    };
  }

  static async getStatistic(): Promise<TicketStatisticsResponse> {
    const response =
      await api.get<ApiResponse<TicketStatisticsResponse>>("/tickets/stats");

    return response.data.data;
  }
}
