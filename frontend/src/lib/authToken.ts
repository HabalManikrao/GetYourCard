// Access-token storage. Kept in localStorage for persistence across reloads.
// Trade-off (documented): localStorage is XSS-readable; the app inlines no untrusted
// HTML and serves uploads as files. For shared deployment, prefer an httpOnly refresh
// cookie (see LOCAL_AND_SHARED_DEPLOYMENT_GUIDE.md).
const KEY = "sm_token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(KEY, token);
  } catch {
    /* storage unavailable */
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export const UNAUTHORIZED_EVENT = "sm-unauthorized";
