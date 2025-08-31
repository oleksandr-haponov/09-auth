// lib/api/api.ts
import axios from "axios";

/**
 * Серверный axios-инстанс для вызова нашего Next API (same-origin).
 * Никаких внешних URL/ENV не используем.
 */
export const nextServer = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { Accept: "application/json" },
  timeout: 15000,
});

export default nextServer;
