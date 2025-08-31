// lib/api/api.ts
import axios, { AxiosInstance } from "axios";

const origin = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
const baseURL = origin ? `${origin}/api` : "/api";

const api: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  timeout: 15000,
});

export default api;
export { api };
