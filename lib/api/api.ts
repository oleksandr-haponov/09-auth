// lib/api/api.ts
import axios from "axios";

const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";
// если переменная не задана, база станет "/api" (relative), чтобы не ломать dev
const baseURL = `${base}/api`;

export const nextServer = axios.create({
  baseURL,
  withCredentials: true, // куки обязательны
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

// единый хелпер для сообщений об ошибках
export function extractError(err: unknown): string {
  if (typeof err === "string") return err;
  const anyErr = err as any;
  const msg = anyErr?.response?.data?.message ?? anyErr?.message ?? "Unexpected error";
  const status: number | undefined = anyErr?.response?.status;
  return status ? `${msg} (HTTP ${status})` : msg;
}

export default nextServer;
