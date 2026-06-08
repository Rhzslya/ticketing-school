import { UserService } from "@/service/user-service";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { LoginUserRequest, RegisterUserRequest } from "@/model/user-model";
import { queryClient } from "@/lib/query-client";

export const USER_KEYS = {
  all: ["users"] as const,
  profile: ["current-user"] as const,
};

export const useUserQueries = () => {
  return {
    useProfile: () => {
      return useQuery({
        queryKey: USER_KEYS.profile,
        queryFn: () => UserService.get(),
        staleTime: Infinity,
        retry: false,
      });
    },

    loginMutation: useMutation({
      mutationFn: (data: LoginUserRequest) => UserService.login(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: USER_KEYS.profile });
      },
    }),

    registerMutation: useMutation({
      mutationFn: (data: RegisterUserRequest) => UserService.register(data),
    }),
  };
};
