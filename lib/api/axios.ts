import axios, { AxiosInstance } from "axios";

const api: AxiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  timeout: 15000,
});

export default api;
export { api };
