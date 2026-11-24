// Thin typed API client. All calls go through the Vite /api proxy.
import type {
  AuthUser,
  FontEntry,
  LanguageEntry,
  Occasion,
  OccasionField,
  ProjectDetail,
  ProjectSummary,
  Template,
  Wording,
} from "./types";

import { getToken, clearToken, UNAUTHORIZED_EVENT } from "./lib/authToken";

const BASE = "/api";

function authHeaders(extra?: HeadersInit): HeadersInit {
  const token = getToken();
  return { ...(extra || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    ...init,
    headers: authHeaders({ "Content-Type": "application/json", ...(init?.headers || {}) }),
  });
  if (!res.ok) {
    if (res.status === 401) {
      // Session expired / invalid — drop the token and let the app react.
      clearToken();
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* non-json error */
    }
    throw new Error(`${res.status}: ${detail}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  health: () => req<{ status: string }>("/health"),

  // Projects
  listProjects: (params?: { q?: string; language?: string; wedding_date?: string }) => {
    const qs = new URLSearchParams(
      Object.entries(params || {}).filter(([, v]) => v) as [string, string][],
    ).toString();
    return req<ProjectSummary[]>(`/projects${qs ? `?${qs}` : ""}`);
  },
  getProject: (id: string) => req<ProjectDetail>(`/projects/${id}`),
  createProject: (data: Record<string, unknown>) =>
    req<ProjectDetail>("/projects", { method: "POST", body: JSON.stringify(data) }),
  updateProject: (id: string, data: Record<string, unknown>) =>
    req<ProjectDetail>(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProject: (id: string) => req<void>(`/projects/${id}`, { method: "DELETE" }),
  duplicateProject: (id: string) =>
    req<ProjectDetail>(`/projects/${id}/duplicate`, { method: "POST" }),

  // Templates
  listTemplates: (opts?: { language?: string; occasion?: string; category?: string }) => {
    const qs = new URLSearchParams(
      Object.entries(opts || {}).filter(([, v]) => v) as [string, string][],
    ).toString();
    return req<Template[]>(`/templates${qs ? `?${qs}` : ""}`);
  },
  getTemplate: (id: string) => req<Template>(`/templates/${id}`),

  // Occasions
  listOccasions: (category?: string) =>
    req<Occasion[]>(`/occasions${category ? `?category=${encodeURIComponent(category)}` : ""}`),
  getOccasion: (id: string) => req<Occasion>(`/occasions/${id}`),
  getOccasionFields: (id: string) => req<OccasionField[]>(`/occasions/${id}/fields`),
  createCustomOccasion: (data: { name: string; category?: string; card_types?: string[]; field_schema: OccasionField[] }) =>
    req<{ id: string; name: string }>("/occasions/custom", { method: "POST", body: JSON.stringify(data) }),

  // Languages & fonts
  listLanguages: (q?: string) => req<LanguageEntry[]>(`/languages${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  listFonts: (script?: string) =>
    req<{ fonts: FontEntry[]; fallback: Record<string, string> | string }>(
      `/fonts${script ? `?script=${script}` : ""}`,
    ),

  messageDefaults: (locale: string) =>
    req<{ locale: string; languageName: string; direction: "ltr" | "rtl"; content: Record<string, string> }>(
      `/message-defaults/${encodeURIComponent(locale)}`,
    ),

  // Wordings
  listWordings: (language?: string) =>
    req<Wording[]>(`/wordings${language ? `?language=${language}` : ""}`),

  // Exports
  createExport: (data: { project_id: string; export_format: string; resolution?: string; data: string }) =>
    req<{ id: string; export_path: string }>("/exports", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  listExports: (project_id?: string) =>
    req<{ id: string; export_format: string; export_path: string; created_at: string }[]>(
      `/exports${project_id ? `?project_id=${project_id}` : ""}`,
    ),

  // Assets
  uploadAsset: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${BASE}/assets/upload`, { method: "POST", body: form, headers: authHeaders() });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(body.detail || "Upload failed");
    }
    return res.json() as Promise<{ id: string; asset_path: string; meta?: { width?: number; height?: number } }>;
  },

  // Auth
  authConfig: () => req<{ auth_required: boolean }>("/auth/config"),
  register: (data: { name: string; email: string; password: string }) =>
    req<{ access_token: string; expires_in: number; user: AuthUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    req<{ access_token: string; expires_in: number; user: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  logout: () => req<{ status: string }>("/auth/logout", { method: "POST" }),
  me: () => req<AuthUser>("/auth/me"),

  // AI (optional)
  aiStatus: () => req<{ enabled: boolean; provider: string | null; image_generation: boolean }>("/ai/status"),
};
