const BASE = import.meta.env.VITE_API_BASE as string;

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export class ApiError extends Error {
  status: number;
  data: any;
  url: string;
  constructor(message: string, opts: { status: number; data: any; url: string }) {
    super(message);
    this.name = "ApiError";
    this.status = opts.status;
    this.data = opts.data;
    this.url = opts.url;
  }
}

export function getToken() {
  return localStorage.getItem("token");
}
export function setToken(token?: string) {
  if (!token) localStorage.removeItem("token");
  else localStorage.setItem("token", token);
}

type RequestOptions = {
  query?: Record<string, string | number | boolean | (string | number | boolean)[] | undefined | null>;
  headers?: HeadersInit;
  credentials?: RequestCredentials; // default: "include"
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const qs = new URLSearchParams();
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      if (Array.isArray(v)) v.forEach((x) => qs.append(k, String(x)));
      else qs.append(k, String(v));
    }
  }
  const joiner = path.includes("?") ? "&" : "?";
  return `${BASE}${path}${qs.toString() ? joiner + qs.toString() : ""}`;
}

async function request<T>(
  url: string,
  method: HttpMethod = "GET",
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fullUrl = buildUrl(url, options.query);

  // debug request
  // console.log("[API] =>", method, fullUrl, { body });

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: options.credentials ?? "include",
  });

  if (res.status === 204) return undefined as T;

  // try to parse json, else text
  let data: any = undefined;
  try {
    data = await res.json();
  } catch {
    try {
      const txt = await res.text();
      data = txt || undefined;
    } catch {
      data = undefined;
    }
  }

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) ||
      res.statusText ||
      `HTTP ${res.status}`;
    // console.error("[API] x", res.status, fullUrl, message, data);
    throw new ApiError(message, { status: res.status, data, url: fullUrl });
  }

  // console.log("[API] <=", res.status, fullUrl);
  return data as T;
}

export const api = {
  get: <T>(url: string, options?: RequestOptions) => request<T>(url, "GET", undefined, options),
  post: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    request<T>(url, "POST", body, options),
  put: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    request<T>(url, "PUT", body, options),
  del: <T>(url: string, options?: RequestOptions) => request<T>(url, "DELETE", undefined, options),
};
