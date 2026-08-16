/**
 * SWR Fetcher Utilities
 * Type-safe fetcher with error handling for SWR
 */

import { ZodError, type ZodType } from "zod";

/**
 * Custom error class for fetch errors with status and response info
 */
export class FetchError extends Error {
  status: number;
  info: unknown;

  constructor(message: string, status: number, info?: unknown) {
    super(message);
    this.name = "FetchError";
    this.status = status;
    this.info = info;
  }
}

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

async function readResponseBody(res: Response): Promise<unknown> {
  if (res.status === 204) return null;

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json().catch(() => null);
  }

  // Fall back to text for non-JSON responses.
  return res.text().catch(() => null);
}

function getErrorMessage(info: unknown, fallback: string): string {
  if (info && typeof info === "object") {
    const d = info as Record<string, unknown>;
    // Prefer 'error' field (standard pattern)
    if (typeof d.error === "string" && d.error.trim()) return d.error;
    // Fallback to 'message' (GitHub/Node error pattern)
    if (typeof d.message === "string" && d.message.trim()) return d.message;
  }
  return typeof info === "string" ? info : fallback;
}

/**
 * Low-level JSON request helper.
 *
 * - Parses JSON when available; falls back to text.
 * - Throws FetchError for non-OK responses.
 */
export async function requestJson<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(url, init);

  const info = await readResponseBody(res);
  if (!res.ok) {
    const message = getErrorMessage(info, "An error occurred");
    throw new FetchError(message, res.status, info);
  }

  return info as T;
}

/**
 * Default fetcher for SWR
 * Throws FetchError on non-OK responses for SWR to handle
 */
export async function fetcher<T>(url: string): Promise<T> {
  return requestJson<T>(url);
}

/**
 * Create a fetcher that validates response JSON with Zod.
 *
 * Best practice: keep runtime validation at the edge of the network boundary
 * so UI logic only ever sees trusted shapes.
 */
export function createZodFetcher<T>(schema: ZodType<T>) {
  return async (url: string): Promise<T> => {
    const data = await fetcher<unknown>(url);
    try {
      return schema.parse(data);
    } catch (err) {
      if (err instanceof ZodError) {
        throw new FetchError("Invalid response from server", 500, {
          issues: err.issues,
        });
      }
      throw err;
    }
  };
}

/**
 * POST fetcher for mutations (e.g., refresh)
 */
export async function postFetcher<T>(url: string): Promise<T> {
  return requestJson<T>(url, { method: "POST" });
}

/**
 * Create a POST fetcher that validates response JSON with Zod.
 */
export function createZodPostFetcher<T>(schema: ZodType<T>) {
  return async (url: string): Promise<T> => {
    const data = await postFetcher<unknown>(url);
    try {
      return schema.parse(data);
    } catch (err) {
      if (err instanceof ZodError) {
        throw new FetchError("Invalid response from server", 500, {
          issues: err.issues,
        });
      }
      throw err;
    }
  };
}

/**
 * JSON mutation fetcher compatible with `swr/mutation`.
 *
 * Example:
 *   useSWRMutation('/api/settings', (url, { arg }) => jsonMutationFetcher(url, { arg }))
 */
export async function jsonMutationFetcher<TResponse, TArg>(
  url: string,
  {
    arg,
    method = "POST",
    headers,
  }: {
    arg: TArg;
    method?: "POST" | "PUT" | "PATCH" | "DELETE";
    headers?: Record<string, string>;
  },
): Promise<TResponse> {
  const jsonBody = arg as unknown as JsonValue;
  return requestJson<TResponse>(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
    body: JSON.stringify(jsonBody),
  });
}

/**
 * Create a JSON mutation fetcher that validates the response with Zod.
 */
export function createZodJsonMutationFetcher<TResponse, TArg>(
  schema: ZodType<TResponse>,
  options?: {
    method?: "POST" | "PUT" | "PATCH" | "DELETE";
    headers?: Record<string, string>;
  },
) {
  return async (url: string, { arg }: { arg: TArg }): Promise<TResponse> => {
    const data = await jsonMutationFetcher<TResponse, TArg>(url, {
      arg,
      method: options?.method,
      headers: options?.headers,
    });

    try {
      return schema.parse(data);
    } catch (err) {
      if (err instanceof ZodError) {
        throw new FetchError("Invalid response from server", 500, {
          issues: err.issues,
        });
      }
      throw err;
    }
  };
}
