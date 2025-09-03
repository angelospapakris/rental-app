const BASE = import.meta.env.VITE_API_BASE as string;

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token?: string) {
  if (!token) localStorage.removeItem("token");
  else localStorage.setItem("token", token);
}

async function request<T>(
  url: string,
  method: HttpMethod = "GET",
  body?: unknown
): Promise<T> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = (data && (data.message || data.error)) || res.statusText;
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  get: <T>(url: string) => request<T>(url, "GET"),
  post: <T>(url: string, body?: unknown) => request<T>(url, "POST", body),
  put:  <T>(url: string, body?: unknown) => request<T>(url, "PUT", body),
  del:  <T>(url: string) => request<T>(url, "DELETE"),
};