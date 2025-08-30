import api from "./axios";
import type { User } from "@/types/user";

/** Базовые креды */
export type Credentials = { email: string; password: string };

/** Алиасы, чтобы импорты в страницах не падали */
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

/** GET /auth/session — может вернуть 200 без тела */
export async function session(): Promise<User | null> {
  const res = await api.get<User | null>("/auth/session");
  return (res.data as User | null) ?? null;
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
