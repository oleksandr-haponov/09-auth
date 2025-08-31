// lib/api/serverApi.ts
import { headers } from "next/headers";
import type { User } from "@/types/user";

/** База API: сначала из .env, иначе — текущий origin */
async function getApiBase(): Promise<string> {
  const envBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (envBase) return `${envBase}/api`;

  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  return `${proto}://${host}/api`;
}

/** Общий fetch для Server Components с пробросом cookie */
async function serverFetch<T>(path: string, cookieHeader?: string, init?: RequestInit): Promise<T> {
  const h = await headers();
  const cookie = cookieHeader ?? h.get("cookie") ?? "";
  const base = await getApiBase();

  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      accept: "application/json",
      ...(init?.headers || {}),
      cookie,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as unknown as T;
  }

  const text = await res.text();
  if (!text) {
    return undefined as unknown as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined as unknown as T;
  }
}

/** GET /users/me — для SSR */
export async function getMeServer(cookieHeader?: string): Promise<User> {
  return await serverFetch<User>("/users/me", cookieHeader);
}

/** GET /auth/session — для SSR; 200 без тела => null */
export async function getSessionServer(cookieHeader?: string): Promise<User | null> {
  const data = await serverFetch<User | undefined>("/auth/session", cookieHeader).catch(
    () => undefined,
  );
  return data ?? null;
}

/** Низкоуровневый вариант, если нужны заголовки (Set-Cookie и т.п.) */
export async function checkServerSession(): Promise<Response> {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const base = await getApiBase();
  return fetch(`${base}/auth/session`, {
    headers: { cookie, accept: "application/json" },
    cache: "no-store",
  });
}
