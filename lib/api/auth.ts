import api from "./axios";
import type { User } from "@/types/user";

export type LoginPayload = { email: string; password: string };
export type RegisterPayload = { email: string; password: string; name?: string };

// Разрешаем оба поля: name (из UI) и username (каноничное для бекенда)
export type UpdateUserPayload = { username?: string; name?: string };

/** POST /auth/login */
export async function login(payload: LoginPayload): Promise<User> {
  const { data } = await api.post<User>("/auth/login", payload);
  return data;
}

/** POST /auth/register (name -> username необязателен) */
export async function register(payload: RegisterPayload): Promise<User> {
  const body: Record<string, unknown> = {
    email: payload.email,
    password: payload.password,
  };
  if (payload.name) body.username = payload.name;

  const { data } = await api.post<User>("/auth/register", body);
  return data;
}

/** POST /auth/logout */
export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

/** GET /auth/session — может вернуть 200 без тела */
export async function getSession(): Promise<User | null> {
  const res = await api.get<User | null>("/auth/session");
  const user = res.data as unknown;
  return user && typeof user === "object" ? (user as User) : null;
}

/** GET /users/me */
export async function getMe(): Promise<User> {
  const { data } = await api.get<User>("/users/me");
  return data;
}

/** PATCH /users/me — маппим name -> username */
export async function updateMe(patch: UpdateUserPayload): Promise<User> {
  const body: Record<string, unknown> = {};
  if (patch.username != null) body.username = patch.username;
  if (patch.name != null && body.username === undefined) body.username = patch.name;

  const { data } = await api.patch<User>("/users/me", body);
  return data;
}
