// lib/api/clientApi.ts
"use client";

import api, { extractError } from "./api";
import type { User } from "@/types/user";

/** Базовые креды */
export type Credentials = { email: string; password: string };

/** Алиасы типов, чтобы импорты на страницах совпадали */
export type RegisterPayload = Credentials;
export type LoginPayload = Credentials;

function normalizeUser(d: unknown): User | null {
  if (!d || typeof d !== "object") return null;
  const u = d as Partial<User>;
  if (typeof u.email === "string" && typeof u.username === "string") {
    return u as User;
  }
  return null;
}

/** POST /auth/register */
export async function register(payload: RegisterPayload): Promise<User> {
  try {
    const { data } = await api.post<User>("/auth/register", payload);
    return data;
  } catch (err) {
    throw new Error(extractError(err));
  }
}

/** POST /auth/login */
export async function login(payload: LoginPayload): Promise<User> {
  try {
    const { data } = await api.post<User>("/auth/login", payload);
    return data;
  } catch (err) {
    throw new Error(extractError(err));
  }
}

/** POST /auth/logout */
export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } catch (err) {
    throw new Error(extractError(err));
  }
}

/** GET /auth/session — вернёт объект пользователя или null при 200 без тела */
export async function session(): Promise<User | null> {
  try {
    const res = await api.get<User | undefined>("/auth/session");
    return normalizeUser(res.data);
  } catch {
    // 401/403/прочее — считаем, что сессии нет
    return null;
  }
}

/** Boolean-проверка активной сессии */
export async function checkSession(): Promise<boolean> {
  const user = await session();
  return !!user;
}

/** GET /users/me */
export async function me(): Promise<User> {
  try {
    const { data } = await api.get<User>("/users/me");
    return data;
  } catch (err) {
    throw new Error(extractError(err));
  }
}

/** PATCH /users/me */
export async function updateMe(patch: { username: string }): Promise<User> {
  try {
    const { data } = await api.patch<User>("/users/me", patch);
    return data;
  } catch (err) {
    throw new Error(extractError(err));
  }
}

/** Алиасы функций — удобно, если где-то ожидаются эти имена */
export const getSession = session;
export const getMe = me;
