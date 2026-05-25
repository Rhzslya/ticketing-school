import { queryClient } from "@/lib/query-client";
import { handleApiError } from "@/lib/utils";
import type { ApiResponse } from "@/model/api-model";
import type {
  DeleteTicketRequest,
  DeleteTicketResponse,
  GetDetailedTicketRequest,
  SearchTicketRequest,
  TicketResponse,
  TicketStatisticsResponse,
  UpdateTicketRequest,
} from "@/model/ticket-model";
import { TicketService } from "@/service/ticket-service";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";
import { toast } from "sonner";

export const TICKET_KEYS = {
  all: ["products"] as const,
  lists: () => [...TICKET_KEYS.all, "list"] as const,
  list: (request: SearchTicketRequest) =>
    [...TICKET_KEYS.lists(), request] as const,
  publicLists: () => [...TICKET_KEYS.all, "public-list"] as const,
  publicList: (request: SearchTicketRequest) =>
    [...TICKET_KEYS.publicLists(), request] as const,
  details: () => [...TICKET_KEYS.all, "detail"] as const,
  detail: (request: GetDetailedTicketRequest) =>
    [...TICKET_KEYS.details(), request.id] as const,
  statistics: () => [...TICKET_KEYS.all, "statistics"] as const,
};

export const useTicketQueries = () => {
  return {
    useList: (
      params: SearchTicketRequest,
    ): UseQueryResult<ApiResponse<TicketResponse[]>, Error> => {
      return useQuery({
        queryKey: TICKET_KEYS.list(params),
        queryFn: () => TicketService.search(params),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 30,
      });
    },

    useDetail: (
      request: GetDetailedTicketRequest,
    ): UseQueryResult<TicketResponse, Error> => {
      return useQuery({
        queryKey: TICKET_KEYS.detail(request),
        queryFn: () => TicketService.get(request),
        enabled: !!request?.id,
        staleTime: 1000 * 60,
      });
    },

    updateTicketMutation: useMutation({
      mutationFn: (data: UpdateTicketRequest): Promise<TicketResponse> =>
        TicketService.update(data),
      onSuccess: (result, variables) => {
        toast.success("Ticket Updated", {
          description: `Ticket ${result.id} updated successfully.`,
        });
        queryClient.invalidateQueries({ queryKey: TICKET_KEYS.lists() });
        queryClient.invalidateQueries({
          queryKey: TICKET_KEYS.detail(variables),
        });
      },
      onError: (error) => handleApiError(error, "Failed to update ticket"),
    }),

    deleteMutation: useMutation({
      mutationFn: (
        request: DeleteTicketRequest,
      ): Promise<DeleteTicketResponse> => TicketService.remove(request),
      onSuccess: (data) => {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: TICKET_KEYS.lists() });
      },
      onError: (error) => handleApiError(error, "Failed to delete ticket"),
    }),

    useStatistics: (): UseQueryResult<TicketStatisticsResponse, Error> => {
      return useQuery({
        queryKey: TICKET_KEYS.statistics(),
        queryFn: () => TicketService.getStatistic(),
        staleTime: 1000 * 60 * 5,
      });
    },
  };
};
