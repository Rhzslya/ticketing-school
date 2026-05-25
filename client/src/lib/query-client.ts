import { QueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (isAxiosError(error) && error.response) {
          const status = error.response.status;
          if (status === 429 || status === 401 || status === 403) {
            return false;
          }
        }
        return failureCount < 3;
      },

      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: (_failureCount, error) => {
        if (isAxiosError(error) && error.response?.status === 429) {
          return false;
        }
        return false;
      },
    },
  },
});
