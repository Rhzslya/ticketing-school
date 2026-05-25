import { isAxiosError } from "axios";
import { toast } from "sonner";

interface ApiErrorResponse {
  errors?: string;
  message?: string;
}

interface ZodIssue {
  message: string;
}

export function getErrorMessage(
  error: unknown,
  defaultMessage: string = "Something went wrong",
): string {
  let errorMessage = defaultMessage;

  if (isAxiosError(error)) {
    const responseData = error.response?.data as unknown;

    if (
      responseData &&
      typeof responseData === "object" &&
      "errors" in responseData
    ) {
      errorMessage =
        (responseData as ApiErrorResponse).errors || defaultMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  if (errorMessage.includes("ZodError") || errorMessage.includes("[")) {
    try {
      const jsonStartIndex = errorMessage.indexOf("[");
      const jsonEndIndex = errorMessage.lastIndexOf("]") + 1;

      if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
        const jsonString = errorMessage.substring(jsonStartIndex, jsonEndIndex);
        const parsed: unknown = JSON.parse(jsonString);

        if (Array.isArray(parsed) && parsed.length > 0) {
          const firstIssue = parsed[0] as ZodIssue;
          if (typeof firstIssue.message === "string") {
            return firstIssue.message;
          }
        }
      }
    } catch (e) {
      console.warn("Failed parsing error Zod", e);
    }
  }

  return errorMessage;
}

export function handleApiError(
  error: unknown,
  defaultMessage: string = "Something went wrong",
) {
  const message = getErrorMessage(error, defaultMessage);
  toast.error("Error", {
    description: message,
  });
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
