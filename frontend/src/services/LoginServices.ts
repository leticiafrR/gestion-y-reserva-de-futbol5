// @ts-nocheck - Mocked for development
import { useMutation } from "@tanstack/react-query";
import { LoginRequest, LoginResponse, LoginResponseSchema } from "@/models/Login";
import { useToken } from "@/services/TokenContext";
import { BASE_API_URL } from "@/config/app-query-client";

export function useLogin() {
  const [, setToken] = useToken();

  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (req: LoginRequest) => {
      const tokenData = await login(req);
      setToken({ state: "LOGGED_IN", ...tokenData, email: req.email });
      return tokenData;
    },
  });
}

async function login(req: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${BASE_API_URL}/sessions`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: req.email,
      password: req.password
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || `Error al iniciar sesión: ${response.status}`);
  }

  const data = await response.json();
  return LoginResponseSchema.parse(data);
} 