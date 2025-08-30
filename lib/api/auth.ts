import api from "./axios";
import type { User } from "@/types/user";

// по ТЗ обязательны email и password; name необязателен
export type RegisterPayload = { email: string; password: string; name?: string };

export async function register(payload: RegisterPayload): Promise<User> {
  // бекенд ожидает email+password; name пробрасываем как username, если есть
  const body: Record<string, unknown> = {
    email: payload.email,
    password: payload.password,
  };
  if (payload.name) body.username = payload.name;

  const { data } = await api.post<User>("/auth/register", body);
  return data;
}
