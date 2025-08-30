import axios, { AxiosInstance } from "axios";

const site = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

const api: AxiosInstance = axios.create({
  baseURL: site ? `${site}/api` : "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

export default api;
export { api };
