export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** True for client errors that should not be retried by TanStack Query. */
export function isClientError(error: unknown): boolean {
  return isApiError(error) && error.status >= 400 && error.status < 500;
}

export async function apiJson<T = unknown>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = undefined;
    }
    const message =
      body && typeof body === 'object' && body !== null && 'error' in body
        ? String((body as { error: unknown }).error)
        : `Request failed (${res.status})`;
    throw new ApiError(res.status, message, body);
  }
  return res.json() as Promise<T>;
}

export async function apiGet<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  return apiJson<T>(url, { ...init, method: 'GET' });
}

/** Normalize list endpoints that return either an array or `{ tickets|meetings|projects: [] }`. */
export function unwrapList<T>(
  data: unknown,
  key: 'tickets' | 'meetings' | 'projects' | 'labels'
): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && key in data) {
    const value = (data as Record<string, unknown>)[key];
    return Array.isArray(value) ? (value as T[]) : [];
  }
  return [];
}

export type PaginatedList<T> = {
  items: T[];
  total: number;
  hasMore: boolean;
};

/** Normalize paginated list endpoints that include `total` / `hasMore`. */
export function unwrapPaginated<T>(
  data: unknown,
  key: 'tickets' | 'meetings' | 'projects' | 'labels'
): PaginatedList<T> {
  if (Array.isArray(data)) {
    return { items: data as T[], total: data.length, hasMore: false };
  }
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const raw = key in obj ? obj[key] : undefined;
    const items = Array.isArray(raw) ? (raw as T[]) : [];
    const total = typeof obj.total === 'number' ? obj.total : items.length;
    const hasMore = typeof obj.hasMore === 'boolean' ? obj.hasMore : false;
    return { items, total, hasMore };
  }
  return { items: [], total: 0, hasMore: false };
}
