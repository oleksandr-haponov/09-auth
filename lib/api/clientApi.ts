import api from "./axios";
import type { User } from "@/types/user";

/** Базовые креды */
export type Credentials = { email: string; password: string };

/** Алиасы типов, чтобы импорты на страницах совпадали */
export type RegisterPayload = Credentials;
export type LoginPayload = Credentials;

/** POST /auth/register */
export async function register(payload: RegisterPayload): Promise<User> {
  const { data } = await api.post<User>("/auth/register", payload);
  return data;
}

/** POST /auth/login */
export async function login(payload: LoginPayload): Promise<User> {
  const { data } = await api.post<User>("/auth/login", payload);
  return data;
}

/** POST /auth/logout */
export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

/** GET /auth/session — может вернуть 200 без тела или 204 */
export async function session(): Promise<User | null> {
  const res = await api.get<User | null>("/auth/session");
  if (res.status === 204) return null;
  const d = res.data as unknown;
  // Нормализуем: пустая строка/undefined/null => null
  if (d == null) return null;
  if (typeof d !== "object") return null;
  return d as User;
}

/** GET /users/me */
export async function me(): Promise<User> {
  const { data } = await api.get<User>("/users/me");
  return data;
}

/** PATCH /users/me */
export async function updateMe(patch: { username: string }): Promise<User> {
  const { data } = await api.patch<User>("/users/me", patch);
  return data;
}

/** Алиасы функций — удобно, если где-то ожидаются эти имена */
export const getSession = session;
export const getMe = me;
