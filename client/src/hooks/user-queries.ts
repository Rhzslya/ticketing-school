import { UserService } from "@/service/user-service";
import { useQuery } from "@tanstack/react-query";

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
  };
};
