import axios from "axios";

const isServer = typeof window === "undefined";
const origin = isServer
  ? process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  : "";

const api = axios.create({
  baseURL: `${origin}/api`,
  withCredentials: true, // cookie-based auth
  headers: { "Content-Type": "application/json" },
});

export default api;
