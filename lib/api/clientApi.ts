import api from "./axios";
import type { User } from "@/types/user";

export type RegisterPayload = { email: string; password: string };

export async function register(payload: RegisterPayload): Promise<User> {
  const { data } = await api.post<User>("/auth/register", payload);
  return data;
}
