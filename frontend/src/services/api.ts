import { env } from "~/utils/env";
import { storage } from "./storage";

const TOKEN_KEY = "token";
const SLOW_REQUEST_MS = 3000;

export class ApiError extends Error {
  readonly status: number;
  readonly details?: Record<string, string>;

  constructor(
    status: number,
    message: string,
    details?: Record<string, string>
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export const getErrorMessage = (error: unknown): string =>
  error instanceof ApiError
    ? error.message
    : "Something went wrong. Try again.";

export const getToken = (): string | null =>
  storage.get<string | null>(TOKEN_KEY, null);

export const setToken = (token: string | null): void => {
  storage.set(TOKEN_KEY, token);
};

let unauthorizedHandler: (() => void) | null = null;

// Called when the server rejects a saved token (expired or invalid)
export const setUnauthorizedHandler = (handler: (() => void) | null): void => {
  unauthorizedHandler = handler;
};

// A request that takes longer than SLOW_REQUEST_MS usually means the free
// server is waking up; the UI shows a notice while any such request is open
let slowRequests = 0;
const slowListeners = new Set<() => void>();

const notifySlowListeners = () => {
  slowListeners.forEach((listener) => listener());
};

export const subscribeToSlowRequests = (listener: () => void) => {
  slowListeners.add(listener);
  return () => {
    slowListeners.delete(listener);
  };
};

export const hasSlowRequests = (): boolean => slowRequests > 0;

interface RequestOptions {
  body?: unknown;
  auth?: boolean;
}

interface ErrorBody {
  error?: { message?: string; details?: Record<string, string> };
}

const request = async <T>(
  method: string,
  path: string,
  { body, auth = true }: RequestOptions = {}
): Promise<T> => {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = auth ? getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let slow = false;
  const timer = setTimeout(() => {
    slow = true;
    slowRequests += 1;
    notifySlowListeners();
  }, SLOW_REQUEST_MS);

  let response: Response;
  try {
    response = await fetch(`${env.apiUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      0,
      "Cannot reach the server. Check your connection and try again."
    );
  } finally {
    clearTimeout(timer);
    if (slow) {
      slowRequests -= 1;
      notifySlowListeners();
    }
  }

  const data: unknown =
    response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    const error = (data as ErrorBody | null)?.error;
    if (response.status === 401 && token) unauthorizedHandler?.();
    throw new ApiError(
      response.status,
      error?.message ?? `Request failed (${response.status})`,
      error?.details
    );
  }

  return data as T;
};

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown, options?: { auth?: boolean }) =>
    request<T>("POST", path, { ...options, body }),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, { body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>("PATCH", path, { body }),
  delete: <T = void>(path: string) => request<T>("DELETE", path),
};
