// lib/api/axios.ts
import axios, { AxiosInstance } from "axios";

const isBrowser = typeof window !== "undefined";
const site = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
const baseURL = isBrowser ? "/api" : site ? `${site}/api` : "/api";

const api: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  timeout: 15000,
});

export default api;
export { api };
