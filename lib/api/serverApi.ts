import "server-only";
import type { User } from "@/types/user";
import { cookies } from "next/headers";

const BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;

async function cookieHeader(): Promise<string> {
  const ck = await cookies();
  return ck
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

export async function sessionServer(): Promise<User | null> {
  const res = await fetch(`${BASE}/auth/session`, {
    headers: { cookie: await cookieHeader(), accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const text = await res.text();
  return text ? (JSON.parse(text) as User) : null;
}

export async function meServer(): Promise<User | null> {
  const res = await fetch(`${BASE}/users/me`, {
    headers: { cookie: await cookieHeader(), accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as User;
}
