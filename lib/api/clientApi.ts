import api from "./axios";
import type { User } from "@/types/user";

/** Базовые креды */
export type Credentials = { email: string; password: string };

/** Алиасы типов, чтобы импорты на страницах совпадали */
export type RegisterPayload = Credentials;
export type LoginPayload = Credentials;

/** POST /auth/register */
export async function register(payload: RegisterPayload): Promise<User> {
  const { data } = await api.post<User>("/auth/register", payload, {
    withCredentials: true,
  });
  return data;
}

/** POST /auth/login */
export async function login(payload: LoginPayload): Promise<User> {
  const { data } = await api.post<User>("/auth/login", payload, {
    withCredentials: true,
  });
  return data;
}

/** POST /auth/logout */
export async function logout(): Promise<void> {
  await api.post("/auth/logout", null, { withCredentials: true });
}

export async function session(): Promise<User | null> {
  const res = await api.get<User | null>("/auth/session", {
    withCredentials: true,
  });
  if (res.status === 204) return null;
  const d = res.data as unknown;
  if (d == null) return null;
  if (typeof d !== "object") return null;
  return d as User;
}

/** NEW: boolean-проверка/рефреш сессии по OAS */
export async function checkSession(): Promise<boolean> {
  try {
    const res = await api.get("/auth/session", { withCredentials: true });
    // За OAS: 200 означает успешный рефреш (в т.ч. Set-Cookie)
    return res.status === 200;
  } catch {
    // 400/401 -> нет активной сессии
    return false;
  }
}

/** GET /users/me */
export async function me(): Promise<User> {
  const { data } = await api.get<User>("/users/me", { withCredentials: true });
  return data;
}

/** PATCH /users/me */
export async function updateMe(patch: { username: string }): Promise<User> {
  const { data } = await api.patch<User>("/users/me", patch, {
    withCredentials: true,
  });
  return data;
}

/** Алиасы функций — удобно, если где-то ожидаются эти имена */
export const getSession = session;
export const getMe = me;
