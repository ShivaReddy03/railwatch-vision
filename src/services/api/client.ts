import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "/api";

export const TOKEN_KEY = "railoptic_access_token";
export const REFRESH_KEY = "railoptic_refresh_token";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

let isRefreshing = false;
apiClient.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry && !isRefreshing) {
      original._retry = true;
      isRefreshing = true;
      try {
        const refresh = localStorage.getItem(REFRESH_KEY);
        if (refresh) {
          // Real refresh would go here
          const res = await apiClient.post("/auth/refresh", { refresh_token: refresh });
          const newToken = (res.data as { access_token: string }).access_token;
          localStorage.setItem(TOKEN_KEY, newToken);
          original.headers?.set("Authorization", `Bearer ${newToken}`);
          return apiClient(original);
        }
      } catch (e) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

export const USE_MOCK = ((import.meta as any).env?.VITE_USE_MOCK_DATA ?? "true") !== "false";
