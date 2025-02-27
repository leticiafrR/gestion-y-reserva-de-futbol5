import { QueryClient } from "@tanstack/react-query";

export const BASE_API_URL = window._env_.baseApiUrl || import.meta.env.VITE_BASE_API_URL;

export const appQueryClient = new QueryClient({});
