const BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  businessIdea: string;
  output: Record<string, unknown> | null;
  websiteOutput: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export const api = {
  auth: {
    signup: (email: string, password: string, name: string) =>
      request<{ user: UserInfo }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
      }),
    login: (email: string, password: string) =>
      request<{ user: UserInfo }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    logout: () =>
      request<{ ok: boolean }>("/auth/logout", { method: "POST" }),
    me: () => request<{ user: UserInfo }>("/auth/me"),
  },
  projects: {
    list: () => request<{ projects: Project[] }>("/projects"),
    get: (id: string) => request<{ project: Project }>(`/projects/${id}`),
    create: (data: { title: string; businessIdea: string; output?: unknown; websiteOutput?: unknown }) =>
      request<{ project: Project }>("/projects", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: { title?: string; output?: unknown; websiteOutput?: unknown }) =>
      request<{ project: Project }>(`/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetch(`${BASE}/projects/${id}`, { method: "DELETE", credentials: "include" }),
  },
};
