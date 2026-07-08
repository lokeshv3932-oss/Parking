import { getToken } from "./auth";
import { getCustomerToken } from "./customerAuth";
import type { ApiErrorBody } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export type AuthMode = boolean | "customer";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}, auth: AuthMode = false): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };

  if (auth === true) {
    const token = getToken();
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  } else if (auth === "customer") {
    const token = getCustomerToken();
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as ApiErrorBody;
      if (body?.message) message = body.message;
    } catch {
      // response had no JSON body
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function apiGet<T>(path: string, auth: AuthMode = false): Promise<T> {
  return request<T>(path, { method: "GET" }, auth);
}

export function apiPost<T>(path: string, body: unknown, auth: AuthMode = false): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) }, auth);
}

export function apiPatch<T>(path: string, body: unknown, auth: AuthMode = false): Promise<T> {
  return request<T>(path, { method: "PATCH", body: JSON.stringify(body) }, auth);
}
