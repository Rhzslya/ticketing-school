import axios, { isAxiosError } from "axios";
import { toast } from "sonner";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAxiosError(error) && error.response) {
      const { status, data, config } = error.response;
      const errorCode = data?.code;

      if (config.skipGlobalErrorHandler) {
        return Promise.reject(error);
      }

      if (status === 401) {
        const isLoginRequest = config.url?.endsWith("/login");

        const currentPath = window.location.pathname;
        const isPublicPage =
          currentPath === "/" ||
          currentPath.startsWith("/login") ||
          currentPath.startsWith("/register") ||
          currentPath.startsWith("/auth/verify") ||
          currentPath.startsWith("/auth/reset-password") ||
          currentPath.startsWith("/forgot-password") ||
          currentPath.startsWith("/products") ||
          currentPath.startsWith("/services/track") ||
          currentPath.startsWith("/about") ||
          currentPath.startsWith("/contact") ||
          currentPath.startsWith("/faq") ||
          currentPath.startsWith("/warranty") ||
          currentPath.startsWith("/privacy") ||
          currentPath.startsWith("/terms");

        if (!isLoginRequest && !isPublicPage) {
          if (errorCode === "SESSION_EXPIRED") {
            toast.error("Session Ended", {
              description: "You have logged in on another device.",
              duration: 5000,
            });
          } else {
            toast.error("Session Expired", {
              description: "Please login again.",
            });
          }

          localStorage.removeItem("role");

          window.location.href = "/login";
        }

        return Promise.reject(error);
      }

      if (status === 403) {
        const isLoginRequest = config.url?.endsWith("/login");
        if (!isLoginRequest) {
          toast.error("Access Denied", {
            description: "You do not have permission to access this resource.",
          });
        }
      }
    }

    return Promise.reject(error);
  },
);
