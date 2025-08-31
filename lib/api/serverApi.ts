// lib/api/serverApi.ts
import { headers } from "next/headers";

/**
 * Формируем базовый URL текущего origin (https://host)/api
 * Без .env и без жёсткого домена.
 */
function getApiBase(): string {
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  return `${proto}://${host}/api`;
}

/**
 * Серверная проверка/refresh сессии.
 * Возвращает исходный Response от нашего Next API /api/auth/session,
 * чтобы можно было прочитать заголовки (в т.ч. Set-Cookie) при необходимости.
 */
export async function checkServerSession(): Promise<Response> {
  const h = headers();
  const cookie = h.get("cookie") ?? "";
  const res = await fetch(`${getApiBase()}/auth/session`, {
    headers: { cookie, accept: "application/json" },
    cache: "no-store",
  });
  return res;
}
